/**
 * Logging middleware for Astro
 * Automatically logs all API requests with timing and error handling
 */

import type { MiddlewareHandler } from "astro";
import { createServerLogger } from "../lib/logger-server";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const startTime = Date.now();
  const { request, url } = context;

  // Only log API routes
  if (!url.pathname.startsWith("/api/")) {
    return next();
  }

  // Create logger instance for this request
  const logger = createServerLogger({
    component: url.pathname,
  });

  const requestId = logger.getRequestId();

  try {
    // Store request ID in context.locals so endpoints can access it
    // Also add to request headers for compatibility
    context.locals.requestId = requestId;
    // Note: Request headers are immutable in Astro, but we can read from context.locals in endpoints

    // Log request start
    await logger.logRequestStart(
      request.method,
      url.pathname + url.search,
      Object.fromEntries(request.headers.entries())
    );

    // Execute the request
    const response = await next();

    // Calculate duration
    const durationMs = Date.now() - startTime;

    // Log request end
    await logger.logRequestEnd(request.method, url.pathname + url.search, response.status, durationMs);

    // Add request ID to response headers for debugging
    response.headers.set("X-Request-ID", requestId);

    return response;
  } catch (error) {
    // Calculate duration even on error
    const durationMs = Date.now() - startTime;

    // Log error
    await logger.error(
      "API request failed",
      {
        method: request.method,
        url: url.pathname + url.search,
        durationMs,
      },
      error
    );

    // Re-throw to let Astro handle it
    throw error;
  }
};
