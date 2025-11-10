import type { APIRoute } from "astro";
import { readFileSync } from "fs";
import { join } from "path";
import { createServerLogger } from "../../lib/logger-server";
import type { VersionResponse } from "../../types";

export const prerender = false;

// Cache dla wersji (unikamy czytania pliku przy każdym requestcie)
let cachedVersion: { version: string; timestamp: number } | null = null;
const CACHE_TTL = 60 * 1000; // 60 sekund

/**
 * Waliduje format wersji (YYYY-MM-DD.N)
 */
function validateVersionFormat(version: string): boolean {
  const versionRegex = /^\d{4}-\d{2}-\d{2}\.\d+$/;
  return versionRegex.test(version);
}

/**
 * Czyta wersję z pliku VERSION
 */
function readVersion(): string {
  const versionFile = join(process.cwd(), "VERSION");
  const version = readFileSync(versionFile, "utf-8").trim();

  if (!validateVersionFormat(version)) {
    throw new Error(`Invalid version format: ${version}. Expected format: YYYY-MM-DD.N`);
  }

  return version;
}

/**
 * GET /api/version
 * Zwraca aktualną wersję aplikacji
 */
export const GET: APIRoute = async ({ locals }) => {
  // Get request ID from context.locals (set by middleware) or create new one
  const requestId = (locals as Record<string, unknown>).requestId as string | undefined;
  const logger = createServerLogger({ component: "api/version", requestId });

  try {
    logger.debug("Fetching application version");

    // Sprawdź cache
    const now = Date.now();
    if (cachedVersion && now - cachedVersion.timestamp < CACHE_TTL) {
      logger.debug("Returning cached version", { version: cachedVersion.version });

      const response: VersionResponse = {
        version: cachedVersion.version,
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60", // Cache w przeglądarce przez 60s
        },
      });
    }

    // Czytaj wersję z pliku
    const version = readVersion();

    // Zaktualizuj cache
    cachedVersion = { version, timestamp: now };

    logger.info("Version fetched successfully", { version });

    const response: VersionResponse = {
      version,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    logger.error("Error fetching version", { error });

    // W przypadku błędu, zwróć fallback
    const response: VersionResponse = {
      version: "unknown",
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
