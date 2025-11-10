import type { APIRoute } from "astro";
import { generateFlashcards } from "../../lib/openrouter";
import { createServerSupabaseClient } from "../../db/supabase-server";
import { createServerLogger } from "../../lib/logger-server";

export const prerender = false;

/**
 * @swagger
 * /api/generate-flashcards:
 *   post:
 *     summary: Generuje fiszki z podanego tekstu za pomocą AI
 *     tags: [Flashcards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Tekst źródłowy do wygenerowania fiszek
 *                 minLength: 1
 *     responses:
 *       200:
 *         description: Fiszki wygenerowane pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flashcards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       front:
 *                         type: string
 *                       back:
 *                         type: string
 *       400:
 *         description: Nieprawidłowe dane (pusty tekst)
 *       401:
 *         description: Brak autoryzacji
 *       500:
 *         description: Błąd serwera lub API AI
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
  // Get request ID from context.locals (set by middleware) or create new one
  const requestId = (locals as any).requestId || undefined;
  const logger = createServerLogger({ component: "api/generate-flashcards", requestId });

  try {
    // Sprawdź autentykację
    const supabase = createServerSupabaseClient(cookies);

    // Sprawdź nagłówek Authorization
    const authHeader = request.headers.get("Authorization");
    let session = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Jeśli token jest w nagłówku Authorization, użyj go do weryfikacji
      const token = authHeader.substring(7);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (!userError && user) {
        // Ustaw sesję w Supabase client, aby mógł wykonywać zapytania
        const {
          data: { session: tokenSession },
          error: sessionError,
        } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: "",
        });

        if (!sessionError && tokenSession) {
          session = tokenSession;
        } else {
          // Jeśli setSession nie działa, utwórz obiekt sesji z user
          session = {
            user: user,
            access_token: token,
            refresh_token: "",
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            token_type: "bearer",
          } as any;
        }
      }
    }

    // Jeśli nie ma sesji z tokenu, spróbuj odczytać z cookies
    if (!session) {
      const {
        data: { session: cookieSession },
      } = await supabase.auth.getSession();
      session = cookieSession;
    }

    if (!session) {
      await logger.warning("Unauthorized access attempt", {
        hasAuthHeader: !!authHeader,
        hasCookies: cookies.getAll().length > 0,
      });
      return new Response(JSON.stringify({ error: "Nieautoryzowany dostęp" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update logger with user context
    const userLogger = logger.withContext({
      userId: session.user.id,
      userEmail: session.user.email,
    });

    // Pobierz body
    if (!request.body) {
      return new Response(JSON.stringify({ error: "Brak danych w żądaniu" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let requestData;
    try {
      requestData = await request.json();
    } catch (parseError: any) {
      return new Response(JSON.stringify({ error: "Nieprawidłowy format danych JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await userLogger.info("Flashcard generation request received", {
      textLength: requestData?.text?.length || 0,
    });

    const { text } = requestData || {};

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Tekst nie może być pusty" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Wygeneruj fiszki (pass logger to maintain request context)
    const flashcards = await generateFlashcards(text, userLogger);

    await userLogger.info("Flashcards generated successfully", {
      count: flashcards.length,
    });

    return new Response(JSON.stringify({ flashcards }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    await logger.error(
      "Flashcard generation failed",
      {
        errorMessage: error.message,
      },
      error
    );
    return new Response(
      JSON.stringify({
        error: error.message || "Błąd generowania fiszek",
        details: import.meta.env.DEV ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
