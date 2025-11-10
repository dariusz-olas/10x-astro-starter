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

    await userLogger.debug("Fetching cards for review", {
      force,
      userId,
      userEmail: session.user.email,
      hasSession: !!session,
      hasAccessToken: !!session.access_token,
    });

    // Test: sprawdź czy możemy pobrać jakiekolwiek dane z flashcards
    const { count: testCount, error: testError } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    await userLogger.info("Test query: total flashcards count", {
      userId,
      count: testCount,
      error: testError
        ? {
            code: testError.code,
            message: testError.message,
            details: testError.details,
          }
        : null,
    });

    let cards: any[] = [];

    if (force) {
      // Tryb force: zwróć wszystkie dostępne karty użytkownika (max 20)
      await userLogger.info("Force mode: querying flashcards", { userId });

      // WAŻNE: Upewnij się, że sesja jest ustawiona przed zapytaniem
      // RLS wymaga poprawnej sesji w Supabase client - setSession powinno być już wywołane wcześniej
      // Ale upewniamy się, że działa przed wykonaniem zapytania
      if (session?.access_token) {
        // Sprawdź aktualną sesję w Supabase client
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!currentSession || currentSession.user.id !== userId) {
          // Sesja nie jest ustawiona lub nie pasuje - ustaw ją ponownie
          await userLogger.warning("Session mismatch, resetting", {
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
        } else {
          await userLogger.info("Session already set correctly in Supabase client", {
            userId: currentSession.user.id,
          });
        }
      }

      const { data: allCards, error: fcErr } = await supabase
        .from("flashcards")
        .select("id, front, back")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (fcErr) {
        await userLogger.error(
          "Failed to fetch flashcards (force mode)",
          {
            userId,
            errorCode: fcErr.code,
            errorMessage: fcErr.message,
            errorDetails: fcErr.details,
          },
          fcErr
        );
        return new Response(JSON.stringify({ error: "Błąd pobierania fiszek" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      await userLogger.info("Force mode: query result", {
        userId,
        cardsReturned: allCards?.length || 0,
        cardsData: allCards?.map((c) => ({ id: c.id, front: c.front?.substring(0, 50) })) || [],
        rawData: allCards, // Pełne dane dla debugowania
      });

      cards = allCards || [];
      await userLogger.info("Cards fetched (force mode)", { count: cards.length, userId });
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
