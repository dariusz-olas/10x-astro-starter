import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { gradeAnswer, nextDueAt } from "../../../lib/scheduling";
import { createServerLogger } from "../../../lib/logger-server";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const requestId = (locals as any).requestId || undefined;
  const logger = createServerLogger({ component: "api/review/submit", requestId });

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
      await logger.warning("Unauthorized review submission attempt", {
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

    const { cardId, grade } = body || {};

    // Walidacja
    if (!cardId || typeof grade !== "number" || grade < 0 || grade > 3) {
      await userLogger.warning("Invalid review submission", { cardId, grade });
      return new Response(JSON.stringify({ error: "Wymagane: { cardId, grade: 0..3 }" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await userLogger.info("Review submission received", { cardId, grade });

    // Pobierz aktualny stan harmonogramu (lub wartości domyślne)
    const { data: schedRow } = await supabase
      .from("card_scheduling")
      .select("ease, interval_days, repetitions")
      .eq("user_id", userId)
      .eq("card_id", cardId)
      .maybeSingle();

    const current = {
      ease: schedRow?.ease ?? 250,
      intervalDays: schedRow?.interval_days ?? 0,
      repetitions: schedRow?.repetitions ?? 0,
    };

    // Oblicz nowy stan używając algorytmu SM-2 lite
    const result = gradeAnswer({ ...current, grade });
    const dueAt = nextDueAt(result.nextIntervalDays);

    // Aktualizuj harmonogram
    const { error: upsertErr } = await supabase.from("card_scheduling").upsert(
      {
        card_id: cardId,
        user_id: userId,
        ease: result.nextEase,
        interval_days: result.nextIntervalDays,
        repetitions: result.nextRepetitions,
        due_at: dueAt.toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "card_id" }
    );

    if (upsertErr) {
      await userLogger.error("Failed to update card scheduling", { cardId, error: upsertErr }, upsertErr);
      return new Response(JSON.stringify({ error: "Błąd zapisu harmonogramu" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Zapisz historię oceny
    const { error: histErr } = await supabase.from("card_reviews").insert({
      user_id: userId,
      card_id: cardId,
      grade,
      prev_interval_days: current.intervalDays,
      new_interval_days: result.nextIntervalDays,
      prev_ease: current.ease,
      new_ease: result.nextEase,
    });

    if (histErr) {
      await userLogger.warning("Failed to insert review history", { cardId, error: histErr }, histErr);
      // Nie zwracamy błędu - historia jest opcjonalna
    }

    await userLogger.info("Review submitted successfully", {
      cardId,
      grade,
      nextIntervalDays: result.nextIntervalDays,
      nextEase: result.nextEase,
    });

    return new Response(
      JSON.stringify({
        cardId,
        next: {
          ease: result.nextEase,
          intervalDays: result.nextIntervalDays,
          repetitions: result.nextRepetitions,
          dueAt: dueAt.toISOString(),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    await logger.error("Review submission failed", {}, error);
    return new Response(JSON.stringify({ error: error.message || "Błąd zapisu odpowiedzi" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
