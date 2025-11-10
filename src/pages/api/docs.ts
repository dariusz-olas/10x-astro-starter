import type { APIRoute } from "astro";
import { swaggerSpec } from "../../lib/swagger";

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
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify(swaggerSpec, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
