import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { formatDatePL } from "../../../lib/dateUtils";
import { createServerLogger } from "../../../lib/logger-server";

export const prerender = false;

function getMostUsedTags(allTags: string[][]): string[] {
  const tagCount: Record<string, number> = {};

  // Zlicz wszystkie tagi
  for (const tagsArray of allTags) {
    if (Array.isArray(tagsArray)) {
      for (const tag of tagsArray) {
        if (tag && typeof tag === "string") {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        }
      }
    }
  }

  // Sortuj po liczbie wystąpień (malejąco) i zwróć top 5
  const sortedTags = Object.entries(tagCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([tag]) => tag);

  return sortedTags;
}

export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const requestId = (locals as any).requestId || undefined;
  const logger = createServerLogger({ component: "api/dashboard/stats", requestId });

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
      await logger.warning("Unauthorized dashboard stats request");
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

    await userLogger.debug("Fetching dashboard stats");

    // 1. Pobierz liczbę fiszek
    const { count: totalCards, error: countError } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      await userLogger.error("Failed to count flashcards", {}, countError);
      return new Response(JSON.stringify({ error: "Błąd pobierania statystyk" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Pobierz ostatnią sesję powtórek
    const { data: lastSession, error: sessionError } = await supabase
      .from("review_sessions")
      .select("completed_at, accuracy")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sessionError) {
      await userLogger.warning("Failed to fetch last review session", {}, sessionError);
    }

    const lastReview = lastSession?.completed_at ? formatDatePL(lastSession.completed_at) : null;
    const accuracy = lastSession?.accuracy ? Number(lastSession.accuracy) : 0;

    // 3. Pobierz wszystkie tagi z fiszek
    const { data: flashcardsWithTags, error: tagsError } = await supabase
      .from("flashcards")
      .select("tags")
      .eq("user_id", userId)
      .not("tags", "is", null);

    if (tagsError) {
      await userLogger.warning("Failed to fetch tags", {}, tagsError);
    }

    // Filtruj fiszki które mają niepuste tablice tagów
    const validTagsArrays = (flashcardsWithTags || [])
      .filter((card) => card.tags && Array.isArray(card.tags) && card.tags.length > 0)
      .map((card) => card.tags as string[]);

    const mostUsedTags = getMostUsedTags(validTagsArrays);

    await userLogger.info("Dashboard stats fetched successfully", {
      totalCards: totalCards || 0,
      hasLastReview: !!lastReview,
      accuracy,
      tagsCount: mostUsedTags.length,
    });

    // Zwróć statystyki
    return new Response(
      JSON.stringify({
        totalCards: totalCards || 0,
        lastReview: lastReview,
        accuracy: Math.round(accuracy),
        mostUsedTags: mostUsedTags,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    await logger.error("Dashboard stats fetch failed", {}, error);
    return new Response(JSON.stringify({ error: error.message || "Błąd pobierania statystyk" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
