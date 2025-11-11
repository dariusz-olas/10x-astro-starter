// Conditional imports for Cloudflare Edge Runtime compatibility
// fs and path are not available in Edge Runtime, so we check at runtime
import { sanitizeData, formatError, getCurrentDateString } from "./logger-utils";
import { LogLevel } from "./logger-types";

// Helper to check if we're in Edge Runtime
function isEdgeRuntime(): boolean {
  // Cloudflare Edge Runtime doesn't have process.versions.node
  return typeof process === "undefined" || !process.versions?.node;
}

// Lazy load fs and path only when needed (and only in Node.js)
async function getFsAndPath(): Promise<{
  fs: typeof import("fs").promises | null;
  join: typeof import("path").join | null;
}> {
  if (isEdgeRuntime()) {
    return { fs: null, join: null };
  }

  try {
    const fsModule = await import("fs");
    const pathModule = await import("path");
    return {
      fs: fsModule.promises,
      join: pathModule.join,
    };
  } catch {
    return { fs: null, join: null };
  }
}

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component?: string;
  requestId?: string;
  userId?: string;
  userEmail?: string;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  logDir: string;
  maxFileSize: number; // bytes
  retentionDays: number;
  minLevel: LogLevel; // Only log entries at or above this level
  environment: string;
  version: string;
}

/**
 * Production-grade logger with file rotation and sanitization
 */
class Logger {
  private config: LoggerConfig;
  private currentDate: string;
  private writeQueue: Promise<void> = Promise.resolve();
  private initialized = false;

  constructor(config?: Partial<LoggerConfig>) {
    // Check if logging is enabled via environment variable
    const logEnabled = import.meta.env.LOG_ENABLED !== "false"; // Default: enabled

    // Determine minimum log level from environment or use defaults
    const envLogLevel = import.meta.env.LOG_LEVEL?.toUpperCase();
    let defaultMinLevel: LogLevel;
    if (envLogLevel && Object.values(LogLevel).includes(envLogLevel as LogLevel)) {
      defaultMinLevel = envLogLevel as LogLevel;
    } else {
      defaultMinLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;
    }

    this.config = {
      logDir: "logs",
      maxFileSize: 10 * 1024 * 1024, // 10MB
      retentionDays: 30,
      minLevel: defaultMinLevel,
      environment: import.meta.env.MODE || "development",
      version: "0.0.1",
      ...config,
    };

    // Disable file logging if LOG_ENABLED=false
    if (!logEnabled) {
      this.config.minLevel = LogLevel.CRITICAL; // Only log critical errors
    }

    this.currentDate = getCurrentDateString();
  }

  /**
   * Initialize logger - create log directory and open file streams
   */
  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Skip initialization in Edge Runtime (fs not available)
    if (isEdgeRuntime()) {
      this.initialized = true; // Mark as initialized to prevent retries
      return;
    }

    try {
      const { fs, join } = await getFsAndPath();
      if (!fs || !join) {
        this.initialized = true;
        return;
      }

      // Create logs directory if it doesn't exist
      await fs.mkdir(this.config.logDir, { recursive: true });

      // Ensure log directory exists (rotateLogsIfNeeded will handle file creation)
      await this.rotateLogsIfNeeded();

      this.initialized = true;
    } catch (error) {
      // Fallback to console if file system operations fail
      console.error("Failed to initialize logger:", error);
      this.initialized = false;
    }
  }

  /**
   * Rotate logs if date changed or file size exceeded
   */
  private async rotateLogsIfNeeded(): Promise<void> {
    // Skip in Edge Runtime
    if (isEdgeRuntime()) {
      return;
    }

    const { fs, join } = await getFsAndPath();
    if (!fs || !join) {
      return;
    }

    const today = getCurrentDateString();

    // Check if date changed
    if (today !== this.currentDate) {
      await this.closeStreams();
      this.currentDate = today;
      await this.cleanOldLogs();
    }

    // Ensure log files exist (they will be created on first write)
    // No need to open file handles - we'll use appendFile directly

    // Check file size and rotate if needed (optional - can be implemented later)
    // For now, we rely on daily rotation
  }

  /**
   * Close all log streams (no-op since we use appendFile directly)
   */
  private async closeStreams(): Promise<void> {
    // No-op - we use appendFile directly, no streams to close
  }

  /**
   * Clean old log files (older than retentionDays)
   */
  private async cleanOldLogs(): Promise<void> {
    // Skip in Edge Runtime
    if (isEdgeRuntime()) {
      return;
    }

    const { fs, join } = await getFsAndPath();
    if (!fs || !join) {
      return;
    }

    try {
      const files = await fs.readdir(this.config.logDir);
      const now = Date.now();
      const retentionMs = this.config.retentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.startsWith("app-") || file.startsWith("error-")) {
          const filePath = join(this.config.logDir, file);
          const stats = await fs.stat(filePath);
          const age = now - stats.mtimeMs;

          if (age > retentionMs) {
            await fs.unlink(filePath);
          }
        }
      }
    } catch (error) {
      // Silently fail - don't break logging if cleanup fails
      console.error("Failed to clean old logs:", error);
    }
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARNING, LogLevel.ERROR, LogLevel.CRITICAL];
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const logLevelIndex = levels.indexOf(level);
    return logLevelIndex >= minLevelIndex;
  }

  /**
   * Check if logging to files is enabled
   */
  private isFileLoggingEnabled(): boolean {
    // Disable file logging in Cloudflare Edge Runtime (fs not available)
    if (isEdgeRuntime()) {
      return false;
    }
    return import.meta.env.LOG_ENABLED !== "false";
  }

  /**
   * Write log entry to file
   */
  private async writeLog(entry: LogEntry): Promise<void> {
    // Skip file logging if disabled
    if (!this.isFileLoggingEnabled()) {
      // Still log to console for critical errors
      if (entry.level === LogLevel.CRITICAL) {
        console.error(`[CRITICAL] ${entry.message}`, entry.error || entry.context || "");
      }
      return;
    }

    // Ensure logger is initialized
    await this.initialize();
    await this.rotateLogsIfNeeded();

    // Sanitize sensitive data
    const sanitizedEntry: LogEntry = {
      ...entry,
      context: entry.context ? (sanitizeData(entry.context) as Record<string, unknown>) : undefined,
      metadata: {
        ...entry.metadata,
        environment: this.config.environment,
        version: this.config.version,
      },
    };

    const logLine = JSON.stringify(sanitizedEntry) + "\n";

    // Queue writes to prevent race conditions
    this.writeQueue = this.writeQueue.then(async () => {
      // Skip file write in Edge Runtime
      if (isEdgeRuntime()) {
        return;
      }

      const { fs, join } = await getFsAndPath();
      if (!fs || !join) {
        return;
      }

      try {
        // Write to app log
        const appLogPath = join(this.config.logDir, `app-${this.currentDate}.log`);
        await fs.appendFile(appLogPath, logLine);

        // Write to error log if ERROR or CRITICAL
        if (entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL) {
          const errorLogPath = join(this.config.logDir, `error-${this.currentDate}.log`);
          await fs.appendFile(errorLogPath, logLine);
        }
      } catch (error) {
        // Fallback to console if file write fails
        console.error("Failed to write log:", error);
        console.error("Log entry:", sanitizedEntry);
      }
    });

    await this.writeQueue;
  }

  /**
   * Create log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    options?: {
      component?: string;
      requestId?: string;
      userId?: string;
      userEmail?: string;
      error?: unknown;
      context?: Record<string, unknown>;
    }
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      component: options?.component,
      requestId: options?.requestId,
      userId: options?.userId,
      userEmail: options?.userEmail,
      context: options?.context,
    };

    if (options?.error) {
      entry.error = formatError(options.error);
    }

    return entry;
  }

  /**
   * Log DEBUG message
   */
  async debug(
    message: string,
    options?: {
      component?: string;
      requestId?: string;
      userId?: string;
      userEmail?: string;
      context?: Record<string, unknown>;
    }
  ): Promise<void> {
    if (!this.shouldLog(LogLevel.DEBUG)) {
      return;
    }

    const entry = this.createLogEntry(LogLevel.DEBUG, message, options);
    await this.writeLog(entry);

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, options?.context || "");
    }
  }

  /**
   * Log INFO message
   */
  async info(
    message: string,
    options?: {
      component?: string;
      requestId?: string;
      userId?: string;
      userEmail?: string;
      context?: Record<string, unknown>;
    }
  ): Promise<void> {
    if (!this.shouldLog(LogLevel.INFO)) {
      return;
    }

    const entry = this.createLogEntry(LogLevel.INFO, message, options);
    await this.writeLog(entry);

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.info(`[INFO] ${message}`, options?.context || "");
    }
  }

  /**
   * Log WARNING message
   */
  async warning(
    message: string,
    options?: {
      component?: string;
      requestId?: string;
      userId?: string;
      userEmail?: string;
      error?: unknown;
      context?: Record<string, unknown>;
    }
  ): Promise<void> {
    if (!this.shouldLog(LogLevel.WARNING)) {
      return;
    }

    const entry = this.createLogEntry(LogLevel.WARNING, message, options);
    await this.writeLog(entry);

    // Always log warnings to console
    console.warn(`[WARNING] ${message}`, options?.context || "");
  }

  /**
   * Log ERROR message
   */
  async error(
    message: string,
    options?: {
      component?: string;
      requestId?: string;
      userId?: string;
      userEmail?: string;
      error?: unknown;
      context?: Record<string, unknown>;
    }
  ): Promise<void> {
    if (!this.shouldLog(LogLevel.ERROR)) {
      return;
    }

    const entry = this.createLogEntry(LogLevel.ERROR, message, options);
    await this.writeLog(entry);

    // Always log errors to console
    console.error(`[ERROR] ${message}`, options?.error || options?.context || "");
  }

  /**
   * Log CRITICAL message
   */
  async critical(
    message: string,
    options?: {
      component?: string;
      requestId?: string;
      userId?: string;
      userEmail?: string;
      error?: unknown;
      context?: Record<string, unknown>;
    }
  ): Promise<void> {
    // CRITICAL logs are always written
    const entry = this.createLogEntry(LogLevel.CRITICAL, message, options);
    await this.writeLog(entry);

    // Always log critical errors to console
    console.error(`[CRITICAL] ${message}`, options?.error || options?.context || "");
  }

  /**
   * Flush all pending writes
   */
  async flush(): Promise<void> {
    await this.writeQueue;
    this.initialized = false;
  }
}

// Export singleton instance
export const logger = new Logger();
