/**
 * Client-side logger wrapper for React components
 * Provides browser-compatible logging with optional API endpoint for error reporting
 */

import { LogLevel } from "./logger-types";
import { generateRequestId } from "./logger-utils";

/**
 * Client-side logger
 */
class ClientLogger {
  private requestId: string;
  private userId?: string;
  private userEmail?: string;
  private component?: string;

  constructor(options?: { requestId?: string; userId?: string; userEmail?: string; component?: string }) {
    this.requestId = options?.requestId || generateRequestId();
    this.userId = options?.userId;
    this.userEmail = options?.userEmail;
    this.component = options?.component;
  }

  /**
   * Create a new logger instance with updated context
   */
  withContext(context: { component?: string; userId?: string; userEmail?: string }): ClientLogger {
    return new ClientLogger({
      requestId: this.requestId,
      userId: context.userId || this.userId,
      userEmail: context.userEmail || this.userEmail,
      component: context.component || this.component,
    });
  }

  /**
   * Get current request ID
   */
  getRequestId(): string {
    return this.requestId;
  }

  /**
   * Log DEBUG message (only in development)
   */
  async debug(message: string, context?: Record<string, unknown>): Promise<void> {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, context);
    }
    // Client-side logs are not written to files - only console
  }

  /**
   * Log INFO message
   */
  async info(message: string, context?: Record<string, unknown>): Promise<void> {
    console.info(`[INFO] ${message}`, context);
    // Optionally send to API endpoint for server-side logging
    await this.sendToServer(LogLevel.INFO, message, context);
  }

  /**
   * Log WARNING message
   */
  async warning(message: string, context?: Record<string, unknown>, error?: unknown): Promise<void> {
    console.warn(`[WARNING] ${message}`, context, error);
    await this.sendToServer(LogLevel.WARNING, message, context, error);
  }

  /**
   * Log ERROR message
   */
  async error(message: string, context?: Record<string, unknown>, error?: unknown): Promise<void> {
    console.error(`[ERROR] ${message}`, context, error);
    await this.sendToServer(LogLevel.ERROR, message, context, error);
  }

  /**
   * Log CRITICAL message
   */
  async critical(message: string, context?: Record<string, unknown>, error?: unknown): Promise<void> {
    console.error(`[CRITICAL] ${message}`, context, error);
    await this.sendToServer(LogLevel.CRITICAL, message, context, error);
  }

  /**
   * Send log entry to server-side API endpoint (optional)
   */
  private async sendToServer(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: unknown
  ): Promise<void> {
    // Only send ERROR and CRITICAL to server
    if (level !== LogLevel.ERROR && level !== LogLevel.CRITICAL) {
      return;
    }

    try {
      // Format error for transmission
      const errorData = error
        ? {
            name: error instanceof Error ? error.name : "UnknownError",
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          }
        : undefined;

      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        component: this.component,
        requestId: this.requestId,
        userId: this.userId,
        userEmail: this.userEmail,
        message,
        error: errorData,
        context,
        metadata: {
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          url: typeof window !== "undefined" ? window.location.href : undefined,
        },
      };

      // Send to API endpoint (if it exists)
      // For now, we'll just log to console - API endpoint can be added later
      // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(logEntry) });
    } catch (sendError) {
      // Silently fail - don't break the app if logging fails
      console.error("Failed to send log to server:", sendError);
    }
  }
}

/**
 * Setup global error handlers
 */
export function setupClientErrorHandlers(): void {
  if (typeof window === "undefined") {
    return;
  }

  const clientLogger = createClientLogger({ component: "global-error-handler" });

  // Handle unhandled errors
  window.addEventListener("error", (event) => {
    clientLogger.error(
      "Unhandled error",
      {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      event.error
    );
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    clientLogger.error("Unhandled promise rejection", {}, event.reason);
  });
}

/**
 * Create a client logger instance
 */
export function createClientLogger(options?: {
  requestId?: string;
  userId?: string;
  userEmail?: string;
  component?: string;
}): ClientLogger {
  return new ClientLogger(options);
}

/**
 * Default export for convenience
 */
export const clientLogger = createClientLogger();
