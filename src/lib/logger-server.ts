/**
 * Server-side logger wrapper for Astro API routes
 * Provides automatic request ID generation and user context extraction
 */

import { logger } from "./logger";
import { LogLevel } from "./logger-types";
import { generateRequestId } from "./logger-utils";
import type { AstroCookies } from "astro";

/**
 * Server-side logger with request context
 */
export class ServerLogger {
  private requestId: string;
  private userId?: string;
  private userEmail?: string;
  private component?: string;

  constructor(options?: {
    requestId?: string;
    userId?: string;
    userEmail?: string;
    component?: string;
  }) {
    this.requestId = options?.requestId || generateRequestId();
    this.userId = options?.userId;
    this.userEmail = options?.userEmail;
    this.component = options?.component;
  }

  /**
   * Create a new logger instance with updated context
   */
  withContext(context: {
    component?: string;
    userId?: string;
    userEmail?: string;
  }): ServerLogger {
    return new ServerLogger({
      requestId: this.requestId,
      userId: context.userId || this.userId,
      userEmail: context.userEmail || this.userEmail,
      component: context.component || this.component,
    });
  }

  /**
   * Extract user context from Supabase session
   */
  static async fromRequest(
    cookies: AstroCookies,
    component?: string
  ): Promise<ServerLogger> {
    // Try to get user from cookies/session
    // This is a placeholder - actual implementation depends on your auth setup
    let userId: string | undefined;
    let userEmail: string | undefined;

    // You can extend this to extract from cookies or session
    // For now, we'll rely on manual setting via withContext

    return new ServerLogger({
      component,
      userId,
      userEmail,
    });
  }

  /**
   * Get current request ID
   */
  getRequestId(): string {
    return this.requestId;
  }

  /**
   * Log DEBUG message
   */
  async debug(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await logger.debug(message, {
      component: this.component,
      requestId: this.requestId,
      userId: this.userId,
      userEmail: this.userEmail,
      context,
    });
  }

  /**
   * Log INFO message
   */
  async info(
    message: string,
    context?: Record<string, unknown>
  ): Promise<void> {
    await logger.info(message, {
      component: this.component,
      requestId: this.requestId,
      userId: this.userId,
      userEmail: this.userEmail,
      context,
    });
  }

  /**
   * Log WARNING message
   */
  async warning(
    message: string,
    context?: Record<string, unknown>,
    error?: unknown
  ): Promise<void> {
    await logger.warning(message, {
      component: this.component,
      requestId: this.requestId,
      userId: this.userId,
      userEmail: this.userEmail,
      context,
      error,
    });
  }

  /**
   * Log ERROR message
   */
  async error(
    message: string,
    context?: Record<string, unknown>,
    error?: unknown
  ): Promise<void> {
    await logger.error(message, {
      component: this.component,
      requestId: this.requestId,
      userId: this.userId,
      userEmail: this.userEmail,
      context,
      error,
    });
  }

  /**
   * Log CRITICAL message
   */
  async critical(
    message: string,
    context?: Record<string, unknown>,
    error?: unknown
  ): Promise<void> {
    await logger.critical(message, {
      component: this.component,
      requestId: this.requestId,
      userId: this.userId,
      userEmail: this.userEmail,
      context,
      error,
    });
  }

  /**
   * Log API request start
   */
  async logRequestStart(
    method: string,
    url: string,
    headers?: Record<string, string>
  ): Promise<void> {
    await this.info("API request started", {
      method,
      url,
      headers: headers ? this.sanitizeHeaders(headers) : undefined,
    });
  }

  /**
   * Log API request end
   */
  async logRequestEnd(
    method: string,
    url: string,
    statusCode: number,
    durationMs: number
  ): Promise<void> {
    await this.info("API request completed", {
      method,
      url,
      statusCode,
      durationMs,
    });
  }

  /**
   * Sanitize headers for logging
   */
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey === "authorization" ||
        lowerKey === "cookie" ||
        lowerKey.includes("token")
      ) {
        sanitized[key] = "***masked***";
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

/**
 * Create a server logger instance
 */
export function createServerLogger(options?: {
  requestId?: string;
  userId?: string;
  userEmail?: string;
  component?: string;
}): ServerLogger {
  return new ServerLogger(options);
}

/**
 * Default export for convenience
 */
export const serverLogger = createServerLogger();

