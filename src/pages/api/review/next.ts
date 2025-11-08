import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { createServerLogger } from "../../../lib/logger-server";

export const prerender = false;

export const GET: APIRoute = async ({ request, cookies, locals }) => {
  const requestId = (locals as any).requestId || undefined;
  const logger = createServerLogger({ component: "api/review/next", requestId });

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
      await logger.warning("Unauthorized review next cards request", {
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
    const nowIso = new Date().toISOString();

    // Sprawdź parametr force z URL
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "true";

    await userLogger.debug("Fetching cards for review", { force });

    let cards: any[] = [];

    if (force) {
      // Tryb force: zwróć wszystkie dostępne karty użytkownika (max 20)
      const { data: allCards, error: fcErr } = await supabase
        .from("flashcards")
        .select("id, front, back")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (fcErr) {
        await userLogger.error("Failed to fetch flashcards (force mode)", {}, fcErr);
        return new Response(JSON.stringify({ error: "Błąd pobierania fiszek" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
      cards = allCards || [];
      await userLogger.info("Cards fetched (force mode)", { count: cards.length });
    } else {
      // Tryb normalny: tylko należne karty (due_at <= now)
      const { data: dueSched, error: dueErr } = await supabase
        .from("card_scheduling")
        .select("card_id, due_at, updated_at")
        .eq("user_id", userId)
        .lte("due_at", nowIso)
        .order("due_at", { ascending: true })
        .order("updated_at", { ascending: true })
        .limit(40);

      if (dueErr) {
        await userLogger.error("Failed to fetch card scheduling", {}, dueErr);
        return new Response(JSON.stringify({ error: "Błąd pobierania harmonogramu" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      const dueIds = (dueSched || []).map((r) => r.card_id);

      if (dueIds.length > 0) {
        const { data: dueCards, error: fcErr } = await supabase
          .from("flashcards")
          .select("id, front, back")
          .eq("user_id", userId)
          .in("id", dueIds)
          .limit(20);

        if (fcErr) {
          await userLogger.error("Failed to fetch due flashcards", {}, fcErr);
          return new Response(JSON.stringify({ error: "Błąd pobierania fiszek" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
        cards = dueCards || [];
      }

      // Jeśli mniej niż 20 należnych kart, dodaj nowe karty (bez harmonogramu)
      if (cards.length < 20) {
        const { data: schedAll } = await supabase
          .from("card_scheduling")
          .select("card_id")
          .eq("user_id", userId)
          .limit(500);

        const scheduledSet = new Set((schedAll || []).map((r) => r.card_id));

        const { data: recentCards } = await supabase
          .from("flashcards")
          .select("id, front, back")
          .eq("user_id", userId)
          .order("created_at", { ascending: true })
          .limit(200);

        if (recentCards && recentCards.length) {
          for (const c of recentCards) {
            if (!scheduledSet.has(c.id)) {
              cards.push(c);
              if (cards.length >= 20) break;
            }
          }
        }
      }
    }

    const finalCards = cards.slice(0, 20);
    await userLogger.info("Cards fetched for review", { count: finalCards.length, force });
    return new Response(JSON.stringify({ cards: finalCards }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    await logger.error("Failed to fetch review cards", {}, error);
    return new Response(JSON.stringify({ error: error.message || "Błąd pobierania kart do powtórki" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
