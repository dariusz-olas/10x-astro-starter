import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { formatDatePL } from "../../../lib/dateUtils";
import { createServerLogger } from "../../../lib/logger-server";
import type { ReviewHistoryItem } from "../../../types";

export const prerender = false;

/**
 * @swagger
 * /api/dashboard/review-history:
 *   get:
 *     summary: Pobiera historię sesji powtórek użytkownika
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Liczba sesji do pobrania (1-100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Przesunięcie (dla paginacji)
 *     responses:
 *       200:
 *         description: Historia sesji powtórek
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   completedAt:
 *                     type: string
 *                     format: date-time
 *                   cardsReviewed:
 *                     type: integer
 *                   cardsCorrect:
 *                     type: integer
 *                   accuracy:
 *                     type: number
 *       401:
 *         description: Brak autoryzacji
 *       500:
 *         description: Błąd serwera
 */
export const GET: APIRoute = async ({ request, cookies, locals, url }) => {
  const requestId = (locals as any).requestId || undefined;
  const logger = createServerLogger({ component: "api/dashboard/review-history", requestId });

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
          refresh_token: refreshTokenCookie || token, // Użyj refresh_token z cookies lub fallback do token
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
          // i ustawić sesję przez cookies
          await logger.warning("setSession failed, trying alternative", {
            sessionError: sessionError?.message,
            hasRefreshTokenCookie: !!refreshTokenCookie,
            userId: user.id,
          });

          // Spróbuj jeszcze raz z pustym refresh_token (czasami działa)
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
            // Ostatnia próba: użyj getUser i ustaw sesję ręcznie
            // To może nie działać z RLS, ale spróbujemy
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
        // RLS wymaga poprawnej sesji w Supabase client
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
      await logger.warning("Unauthorized review history request", {
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

    // Pobierz parametry z URL z walidacją
    const searchParams = url.searchParams;
    const limitRaw = searchParams.get("limit") || "10";
    const offsetRaw = searchParams.get("offset") || "0";

    // Walidacja: limit musi być 1-100, offset musi być >= 0
    const limit = Math.max(1, Math.min(100, parseInt(limitRaw, 10) || 10));
    const offset = Math.max(0, parseInt(offsetRaw, 10) || 0);

    await userLogger.debug("Fetching review history", { limit, offset });

    // Pobierz sesje powtórek
    const { data: sessions, error: sessionsError } = await supabase
      .from("review_sessions")
      .select("id, completed_at, cards_reviewed, cards_correct, accuracy")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (sessionsError) {
      await userLogger.error("Failed to fetch review sessions", {}, sessionsError);
      return new Response(JSON.stringify({ error: "Błąd pobierania historii" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Formatuj dane
    const history: ReviewHistoryItem[] = (sessions || []).map((session) => ({
      id: session.id,
      completedAt: session.completed_at,
      cardsReviewed: session.cards_reviewed,
      cardsCorrect: session.cards_correct,
      accuracy: Number(session.accuracy),
    }));

    await userLogger.info("Review history fetched successfully", {
      count: history.length,
      limit,
      offset,
    });

    return new Response(JSON.stringify(history), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=180", // 3 min cache
      },
    });
  } catch (error: any) {
    await logger.error("Review history fetch failed", {}, error);
    return new Response(JSON.stringify({ error: error.message || "Błąd pobierania historii" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
