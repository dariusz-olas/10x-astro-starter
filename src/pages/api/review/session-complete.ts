import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { createServerLogger } from "../../../lib/logger-server";

export const prerender = false;

/**
 * @swagger
 * /api/review/session-complete:
 *   post:
 *     summary: Zapisuje ukończoną sesję powtórek
 *     tags: [Review]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cardsReviewed
 *               - cardsCorrect
 *             properties:
 *               cardsReviewed:
 *                 type: integer
 *                 minimum: 0
 *                 description: Liczba przejrzanych kart
 *               cardsCorrect:
 *                 type: integer
 *                 minimum: 0
 *                 description: Liczba poprawnie odpowiedzianych kart (musi być <= cardsReviewed)
 *     responses:
 *       200:
 *         description: Sesja zapisana pomyślnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   format: uuid
 *                 accuracy:
 *                   type: number
 *       400:
 *         description: Nieprawidłowe dane
 *       401:
 *         description: Brak autoryzacji
 *       500:
 *         description: Błąd serwera
 */
export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const requestId = (locals as any).requestId || undefined;
  const logger = createServerLogger({ component: "api/review/session-complete", requestId });

  try {
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
        // WAŻNE: Dla RLS musimy ustawić sesję w Supabase client
        // Spróbuj najpierw pobrać refresh_token z cookies
        const refreshTokenCookie = cookies.get("sb-access-token")?.value || cookies.get("sb-refresh-token")?.value;

        // Ustaw sesję w Supabase client - RLS wymaga poprawnej sesji
        const {
          data: { session: tokenSession },
          error: sessionError,
        } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: refreshTokenCookie || token,
        });

        if (!sessionError && tokenSession) {
          session = tokenSession;
          await logger.info("Session set via setSession", {
            userId: session.user.id,
            hasAccessToken: !!session.access_token,
            hasRefreshToken: !!session.refresh_token,
          });
        } else {
          // Jeśli setSession nie działa, spróbuj użyć getUser do weryfikacji
          await logger.warning("setSession failed, trying alternative", {
            sessionError: sessionError?.message,
            hasRefreshTokenCookie: !!refreshTokenCookie,
            userId: user.id,
          });

          // Spróbuj jeszcze raz z pustym refresh_token
          const {
            data: { session: retrySession },
            error: retryError,
          } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: "",
          });

          if (!retryError && retrySession) {
            session = retrySession;
            await logger.info("Session set via retry setSession", {
              userId: retrySession.user.id,
            });
          } else {
            await logger.warning("All setSession attempts failed, using manual session", {
              retryError: retryError?.message,
              userId: user.id,
            });
            session = {
              user: user,
              access_token: token,
              refresh_token: refreshTokenCookie || "",
              expires_in: 3600,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              token_type: "bearer",
            } as any;
          }
        }
      }
    }

    // Jeśli nie ma sesji z tokenu, spróbuj odczytać z cookies
    if (!session) {
      const {
        data: { session: cookieSession },
        error: cookieError,
      } = await supabase.auth.getSession();

      if (cookieSession) {
        session = cookieSession;
        await logger.info("Session retrieved from cookies", {
          userId: session.user.id,
          hasAccessToken: !!session.access_token,
          hasRefreshToken: !!session.refresh_token,
        });

        // WAŻNE: Upewnij się, że sesja z cookies jest ustawiona w Supabase client dla RLS
        const { error: setSessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token || "",
        });

        if (setSessionError) {
          await logger.warning("Failed to set session from cookies", {
            error: setSessionError.message,
          });
        } else {
          await logger.info("Session from cookies set successfully in Supabase client");
        }
      } else {
        await logger.debug("No session in cookies", {
          cookieError: cookieError?.message,
        });
      }
    }

    if (!session) {
      await logger.warning("Unauthorized session complete request", {
        hasAuthHeader: !!authHeader,
        hasCookies: cookies.getAll().length > 0,
      });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = session.user.id;
    const userLogger = logger.withContext({
      userId: session.user.id,
      userEmail: session.user.email,
    });

    // Parsuj body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Nieprawidłowe JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { cardsReviewed, cardsCorrect } = body || {};

    // Walidacja
    if (
      typeof cardsReviewed !== "number" ||
      typeof cardsCorrect !== "number" ||
      cardsReviewed < 0 ||
      cardsCorrect < 0 ||
      cardsCorrect > cardsReviewed
    ) {
      return new Response(
        JSON.stringify({
          error: "Wymagane: { cardsReviewed: number >= 0, cardsCorrect: number >= 0 && <= cardsReviewed }",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // WAŻNE: Upewnij się, że sesja jest ustawiona przed zapytaniem do bazy
    // RLS wymaga poprawnej sesji w Supabase client
    if (session?.access_token) {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession || currentSession.user.id !== userId) {
        await userLogger.warning("Session mismatch before query, resetting", {
          currentUserId: currentSession?.user.id,
          expectedUserId: userId,
        });

        const { error: sessionCheckError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token || "",
        });

        if (sessionCheckError) {
          await userLogger.error(
            "setSession failed before query",
            {
              error: sessionCheckError.message,
            },
            sessionCheckError
          );
        } else {
          await userLogger.info("Session reset successfully before query");
        }
      }
    }

    await userLogger.debug("Saving review session", { cardsReviewed, cardsCorrect });

    // Zapisz sesję do review_sessions
    // Kolumna accuracy zostanie obliczona automatycznie przez computed column
    const { data, error: insertError } = await supabase
      .from("review_sessions")
      .insert({
        user_id: userId,
        completed_at: new Date().toISOString(),
        cards_reviewed: cardsReviewed,
        cards_correct: cardsCorrect,
      })
      .select()
      .single();

    if (insertError) {
      await userLogger.error(
        "Failed to save review session",
        {
          cardsReviewed,
          cardsCorrect,
        },
        insertError
      );
      return new Response(JSON.stringify({ error: "Błąd zapisu sesji powtórek" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await userLogger.info("Review session completed", {
      sessionId: data.id,
      cardsReviewed: data.cards_reviewed,
      cardsCorrect: data.cards_correct,
      accuracy: data.accuracy,
    });

    return new Response(
      JSON.stringify({
        id: data.id,
        completed_at: data.completed_at,
        cards_reviewed: data.cards_reviewed,
        cards_correct: data.cards_correct,
        accuracy: data.accuracy,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    await logger.error("Session complete failed", {}, error);
    return new Response(JSON.stringify({ error: error.message || "Błąd zapisu sesji" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
