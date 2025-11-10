/**
 * Utility functions for logging system
 * - Sanitization of sensitive data
 * - Request ID generation
 * - Log formatting helpers
 */

/**
 * Sanitizes sensitive data from objects/strings
 * Masks: tokens, passwords, API keys, emails (partially), URLs with tokens
 */
export function sanitizeData(data: unknown, depth = 0): unknown {
  // Prevent infinite recursion
  if (depth > 10) {
    return "[Max depth reached]";
  }

  // Handle null/undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle strings
  if (typeof data === "string") {
    return sanitizeString(data);
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  // Handle objects
  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();

      // Skip sensitive keys entirely or mask them
      if (
        lowerKey.includes("password") ||
        lowerKey.includes("secret") ||
        lowerKey === "token" ||
        lowerKey === "access_token" ||
        lowerKey === "refresh_token" ||
        lowerKey === "api_key" ||
        lowerKey === "apikey"
      ) {
        sanitized[key] = "***masked***";
      } else if (lowerKey === "authorization" || lowerKey === "auth") {
        // Mask Bearer tokens
        if (typeof value === "string" && value.startsWith("Bearer ")) {
          sanitized[key] = "Bearer ***masked***";
        } else {
          sanitized[key] = "***masked***";
        }
      } else if (lowerKey === "email" && typeof value === "string") {
        // Partially mask email: u***@example.com
        const emailParts = value.split("@");
        if (emailParts.length === 2) {
          const [local, domain] = emailParts;
          sanitized[key] = `${local.charAt(0)}***@${domain}`;
        } else {
          sanitized[key] = "***masked***";
        }
      } else {
        sanitized[key] = sanitizeData(value, depth + 1);
      }
    }
    return sanitized;
  }

  // Return primitives as-is
  return data;
}

/**
 * Sanitizes a string, masking sensitive patterns
 */
function sanitizeString(str: string): string {
  // Mask API keys (sk-or-v1-..., sk-...)
  str = str.replace(/sk-or-v1-[a-zA-Z0-9_-]+/g, "sk-or-v1-***masked***");
  str = str.replace(/sk-[a-zA-Z0-9_-]{20,}/g, "sk-***masked***");

  // Mask Bearer tokens
  str = str.replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer ***masked***");

  // Mask URLs with tokens in query params
  str = str.replace(/[?&](token|key|api_key|access_token|refresh_token)=[^&\s]+/gi, (match) => {
    return match.split("=")[0] + "=***masked***";
  });

  // Mask passwords in JSON-like structures
  str = str.replace(/"password"\s*:\s*"[^"]+"/gi, '"password":"***masked***"');
  str = str.replace(/"password"\s*:\s*'[^']+'/gi, '"password":"***masked***"');

  return str;
}

/**
 * Generates a unique request ID
 * Format: req-{timestamp}-{random}
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `req-${timestamp}-${random}`;
}

/**
 * Formats error object for logging
 */
export function formatError(error: unknown): {
  name: string;
  message: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === "string") {
    return {
      name: "Error",
      message: error,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

/**
 * Gets current date in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Gets log file path for a given date
 */
export function getLogFilePath(date: string, type: "app" | "error" = "app"): string {
  return `logs/${type}-${date}.log`;
}
