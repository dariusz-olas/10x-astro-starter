import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { formatDatePL } from "../../../lib/dateUtils";
import { createServerLogger } from "../../../lib/logger-server";
import type { TagStat } from "../../../types";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const requestId = (locals as any).requestId || undefined;
  const logger = createServerLogger({ component: "api/dashboard/tag-stats", requestId });

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
      await logger.warning("Unauthorized tag stats request", {
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

    await userLogger.debug("Fetching tag stats");

    // 1. Pobierz wszystkie fiszki użytkownika z tagami
    const { data: flashcards, error: flashcardsError } = await supabase
      .from("flashcards")
      .select("id, tags")
      .eq("user_id", userId)
      .not("tags", "is", null);

    if (flashcardsError) {
      await userLogger.error("Failed to fetch flashcards", {}, flashcardsError);
      return new Response(JSON.stringify({ error: "Błąd pobierania statystyk tagów" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Zgrupuj fiszki po tagach
    const tagToCardIds: Record<string, string[]> = {};

    for (const card of flashcards || []) {
      if (card.tags && Array.isArray(card.tags)) {
        for (const tag of card.tags) {
          if (tag && typeof tag === "string") {
            if (!tagToCardIds[tag]) {
              tagToCardIds[tag] = [];
            }
            tagToCardIds[tag].push(card.id);
          }
        }
      }
    }

    // 3. Optymalizacja: Pobierz wszystkie dane jednym zapytaniem (zamiast N+1)
    const allCardIds = Object.values(tagToCardIds).flat();

    // Pobierz wszystkie reviews dla wszystkich fiszek użytkownika
    const { data: allReviews, error: allReviewsError } = await supabase
      .from("card_reviews")
      .select("reviewed_at, grade, card_id")
      .eq("user_id", userId)
      .in("card_id", allCardIds);

    if (allReviewsError) {
      await userLogger.error("Failed to fetch all reviews", {}, allReviewsError);
      return new Response(JSON.stringify({ error: "Błąd pobierania statystyk tagów" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobierz wszystkie cardsDue dla wszystkich fiszek
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const todayISO = today.toISOString();

    const { data: allCardsDue, error: cardsDueError } = await supabase
      .from("card_scheduling")
      .select("card_id")
      .eq("user_id", userId)
      .in("card_id", allCardIds)
      .lte("due_at", todayISO);

    if (cardsDueError) {
      await userLogger.warning("Failed to fetch cards due", {}, cardsDueError);
    }

    // 4. Przetwórz dane w pamięci dla każdego tagu
    const tagStats: TagStat[] = [];

    for (const [tag, cardIds] of Object.entries(tagToCardIds)) {
      // Filtruj reviews dla tego tagu
      const tagReviews = (allReviews || []).filter((r) => cardIds.includes(r.card_id));

      // Oblicz średnią poprawność (grade >= 2 to poprawna odpowiedź)
      const correctReviews = tagReviews.filter((r) => r.grade >= 2).length;
      const averageAccuracy = tagReviews.length > 0 ? Math.round((correctReviews / tagReviews.length) * 100) : 0;

      // Znajdź ostatnią powtórkę
      const lastReviewDate =
        tagReviews.length > 0
          ? tagReviews.map((r) => new Date(r.reviewed_at)).sort((a, b) => b.getTime() - a.getTime())[0]
          : null;

      // Zlicz fiszki do powtórki dla tego tagu
      const tagCardsDue = (allCardsDue || []).filter((c) => cardIds.includes(c.card_id));

      tagStats.push({
        tag,
        cardCount: cardIds.length,
        averageAccuracy,
        lastReview: lastReviewDate ? formatDatePL(lastReviewDate) : null,
        cardsDue: tagCardsDue.length,
      });
    }

    // Sortuj po liczbie fiszek (malejąco)
    tagStats.sort((a, b) => b.cardCount - a.cardCount);

    await userLogger.info("Tag stats fetched successfully", {
      tagsCount: tagStats.length,
    });

    // Zwróć statystyki z cache headers
    return new Response(JSON.stringify(tagStats), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300", // 5 minut cache
      },
    });
  } catch (error: any) {
    await logger.error("Tag stats fetch failed", {}, error);
    return new Response(JSON.stringify({ error: error.message || "Błąd pobierania statystyk tagów" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
