import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { createServerLogger } from "../../../lib/logger-server";

export const prerender = false;

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
      await userLogger.error("Failed to save review session", {
        cardsReviewed,
        cardsCorrect,
      }, insertError);
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
