import type { APIRoute } from "astro";
import { createServerLogger } from "../../lib/logger-server";
import type { VersionResponse } from "../../types";

// Import wersji w build time (kompatybilne z Cloudflare Edge Runtime)
// Vite/Astro wspiera import ?raw dla plików tekstowych
import versionContent from "../../../VERSION?raw";

export const prerender = false;

/**
 * Waliduje format wersji (YYYY-MM-DD.N)
 */
function validateVersionFormat(version: string): boolean {
  const versionRegex = /^\d{4}-\d{2}-\d{2}\.\d+$/;
  return versionRegex.test(version);
}

/**
 * Pobiera wersję aplikacji
 * Wersja jest wbudowana w build time przez import statyczny,
 * dzięki czemu działa w Cloudflare Edge Runtime bez dostępu do file system
 */
function getVersion(): string {
  try {
    const version = versionContent.trim();

    if (!version) {
      throw new Error("VERSION file is empty");
    }

    if (!validateVersionFormat(version)) {
      throw new Error(`Invalid version format: ${version}. Expected format: YYYY-MM-DD.N`);
    }

    return version;
  } catch (error) {
    // W przypadku błędu, zwróć fallback
    console.error("Failed to get version:", error);
    return "unknown";
  }
}

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: Zwraca wersję aplikacji
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Wersja aplikacji
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   description: Wersja w formacie YYYY-MM-DD.N
 *                   example: "2025-11-10.1"
 *         headers:
 *           Cache-Control:
 *             description: Cache public przez 5 minut
 *             schema:
 *               type: string
 *               example: "public, max-age=300, immutable"
 *       500:
 *         description: Błąd serwera
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 version:
 *                   type: string
 *                   example: "unknown"
 */
export const GET: APIRoute = async ({ locals }) => {
  // Get request ID from context.locals (set by middleware) or create new one
  const requestId = (locals as Record<string, unknown>).requestId as string | undefined;
  const logger = createServerLogger({ component: "api/version", requestId });

  try {
    await logger.debug("Fetching application version");

    // Pobierz wersję (wbudowaną w build time)
    const version = getVersion();

    await logger.info("Version fetched successfully", { version });

    const response: VersionResponse = {
      version,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache w przeglądarce przez 5 minut (wersja zmienia się rzadko)
        "Cache-Control": "public, max-age=300, immutable",
      },
    });
  } catch (error) {
    await logger.error("Error fetching version", { error });

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
