import type { APIRoute } from "astro";

export const prerender = false;

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Zwraca dokumentację API w formacie OpenAPI
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Dokumentacja API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    // W Cloudflare Edge Runtime, swagger-jsdoc nie działa (wymaga Node.js APIs)
    // Dokumentacja jest generowana w build time i zapisana jako statyczny plik w public/
    // W Edge Runtime, pliki z public/ są dostępne jako statyczne assets
    // Używamy fetch do odczytania pliku z publicznego URL
    const baseUrl = new URL(url);
    const docsUrl = new URL("/api-docs.json", baseUrl.origin);
    
    const response = await fetch(docsUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch docs: ${response.status}`);
    }
    
    const swaggerSpec = await response.json();

    return new Response(JSON.stringify(swaggerSpec, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600", // Cache przez 1 godzinę
      },
    });
  } catch (error: any) {
    // Fallback jeśli plik nie istnieje (np. w dev mode bez builda)
    return new Response(
      JSON.stringify({
        error: "API documentation not available",
        message: "Run 'npm run docs:generate' to generate documentation",
        details: error?.message || "Unknown error",
        note: "Documentation is generated at build time and stored in public/api-docs.json",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
