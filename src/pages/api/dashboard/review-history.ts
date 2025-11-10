import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { formatDatePL } from "../../../lib/dateUtils";
import { createServerLogger } from "../../../lib/logger-server";
import type { ReviewHistoryItem } from "../../../types";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, locals, url }) => {
  const requestId = (locals as any).requestId || undefined;
  const logger = createServerLogger({ component: "api/dashboard/review-history", requestId });

  try {
    const supabase = createServerSupabaseClient(cookies);

    // Sprawdź nagłówek Authorization
    const authHeader = request.headers.get("Authorization");
    let session = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (!userError && user) {
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

    if (!session) {
      const {
        data: { session: cookieSession },
      } = await supabase.auth.getSession();
      session = cookieSession;
    }

    if (!session) {
      await logger.warning("Unauthorized review history request");
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

    // Pobierz parametry z URL (opcjonalnie: limit, offset)
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

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
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    await logger.error("Review history fetch failed", {}, error);
    return new Response(JSON.stringify({ error: error.message || "Błąd pobierania historii" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
