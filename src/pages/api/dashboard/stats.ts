import type { APIRoute } from "astro";
import { createServerSupabaseClient } from "../../../db/supabase-server";
import { formatDatePL, getWeekStart, getMonthStart, getTodayISO } from "../../../lib/dateUtils";
import { createServerLogger } from "../../../lib/logger-server";
import { calculateStreak, getMostActiveDay, countActiveDays, roundTo } from "../../../lib/stats-utils";
import type {
  DashboardStats,
  ReviewSession,
  CardReview,
  ActivityChartData,
  AccuracyChartData,
  CardsDistributionData,
  TagDistributionData,
} from "../../../types";

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

/**
 * Przygotowuje dane dla wykresu aktywności (ostatnie 30 dni)
 */
function prepareActivityChartData(reviews: { reviewed_at: string }[]): ActivityChartData[] {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Grupuj powtórki po datach
  const reviewsByDate: Record<string, number> = {};
  for (const review of reviews) {
    const date = new Date(review.reviewed_at);
    if (date >= thirtyDaysAgo) {
      const dateStr = date.toISOString().split("T")[0];
      reviewsByDate[dateStr] = (reviewsByDate[dateStr] || 0) + 1;
    }
  }

  // Stwórz tablicę dla wszystkich 30 dni (wypełnioną zerami gdzie brak danych)
  const chartData: ActivityChartData[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    chartData.push({
      date: dateStr,
      reviews: reviewsByDate[dateStr] || 0,
    });
  }

  return chartData;
}

/**
 * Przygotowuje dane dla wykresu poprawności (ostatnie 10 sesji)
 */
function prepareAccuracyChartData(sessions: ReviewSession[]): AccuracyChartData[] {
  // Weź ostatnie 10 sesji (już posortowane)
  const last10 = sessions.slice(-10);

  return last10.map((session, index) => ({
    session: `S${index + 1}`,
    accuracy: roundTo(Number(session.accuracy), 1),
    date: formatDatePL(session.completed_at) || "",
  }));
}

/**
 * Przygotowuje dane dla wykresu kołowego rozkładu fiszek
 */
function prepareCardsDistribution(
  newCards: number,
  learningCards: number,
  masteredCards: number
): CardsDistributionData[] {
  return [
    { name: "Nowe", value: newCards, fill: "#ef4444" }, // red-500
    { name: "W nauce", value: learningCards, fill: "#f59e0b" }, // amber-500
    { name: "Opanowane", value: masteredCards, fill: "#10b981" }, // emerald-500
  ];
}

/**
 * Przygotowuje dane dla wykresu słupkowego tagów
 */
function prepareTagDistribution(allTags: string[][]): TagDistributionData[] {
  const tagCount: Record<string, number> = {};

  for (const tagsArray of allTags) {
    if (Array.isArray(tagsArray)) {
      for (const tag of tagsArray) {
        if (tag && typeof tag === "string") {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        }
      }
    }
  }

  // Sortuj i weź top 5
  return Object.entries(tagCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
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
      await logger.warning("Unauthorized dashboard stats request", {
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

    // ===== NOWE STATYSTYKI =====

    // 4. Statystyki powtórek - łączna liczba powtórek
    const { count: totalReviews, error: reviewsCountError } = await supabase
      .from("card_reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (reviewsCountError) {
      await userLogger.warning("Failed to count card reviews", {}, reviewsCountError);
    }

    // 5. Średnia poprawność ze wszystkich sesji
    const { data: allSessions, error: allSessionsError } = await supabase
      .from("review_sessions")
      .select("accuracy, completed_at, id, user_id, cards_reviewed, cards_correct")
      .eq("user_id", userId)
      .order("completed_at", { ascending: true });

    if (allSessionsError) {
      await userLogger.warning("Failed to fetch all review sessions", {}, allSessionsError);
    }

    const sessions = (allSessions || []) as ReviewSession[];
    const averageAccuracy =
      sessions.length > 0 ? roundTo(sessions.reduce((sum, s) => sum + Number(s.accuracy), 0) / sessions.length, 1) : 0;

    // 6. Najdłuższa seria dni z powtórkami
    const longestStreak = calculateStreak(sessions);

    // 7. Fiszki do powtórki dzisiaj (due_at <= teraz)
    const today = getTodayISO();
    const { count: cardsDueToday, error: cardsDueError } = await supabase
      .from("card_scheduling")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("due_at", today);

    if (cardsDueError) {
      await userLogger.warning("Failed to count cards due today", {}, cardsDueError);
    }

    // 8. Statystyki algorytmu SM-2
    const { data: schedulingData, error: schedulingError } = await supabase
      .from("card_scheduling")
      .select("ease, interval_days, repetitions")
      .eq("user_id", userId);

    if (schedulingError) {
      await userLogger.warning("Failed to fetch scheduling data", {}, schedulingError);
    }

    const scheduling = schedulingData || [];
    const averageEase =
      scheduling.length > 0 ? roundTo(scheduling.reduce((sum, s) => sum + s.ease, 0) / scheduling.length, 0) : 0;
    const averageInterval =
      scheduling.length > 0
        ? roundTo(scheduling.reduce((sum, s) => sum + s.interval_days, 0) / scheduling.length, 1)
        : 0;

    const newCards = scheduling.filter((s) => s.repetitions === 0).length;
    const learningCards = scheduling.filter((s) => s.repetitions > 0 && s.interval_days < 30).length;
    const masteredCards = scheduling.filter((s) => s.interval_days >= 30).length;

    // 9. Statystyki czasowe - fiszki dodane w tym tygodniu/miesiącu
    const weekStart = getWeekStart();
    const monthStart = getMonthStart();

    const { count: cardsAddedThisWeek, error: weekCountError } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", weekStart);

    if (weekCountError) {
      await userLogger.warning("Failed to count cards added this week", {}, weekCountError);
    }

    const { count: cardsAddedThisMonth, error: monthCountError } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart);

    if (monthCountError) {
      await userLogger.warning("Failed to count cards added this month", {}, monthCountError);
    }

    // 10. Aktywność w ostatnich 7/30 dniach
    const activeDaysLast7Days = countActiveDays(sessions, 7);
    const activeDaysLast30Days = countActiveDays(sessions, 30);

    // 11. Najaktywniejszy dzień tygodnia
    const mostActiveDayOfWeek = getMostActiveDay(sessions);

    // ===== DANE DLA WYKRESÓW (FAZA 2) =====

    // 12. Pobierz card_reviews dla wykresu aktywności
    const { data: allReviews, error: allReviewsError } = await supabase
      .from("card_reviews")
      .select("reviewed_at")
      .eq("user_id", userId);

    if (allReviewsError) {
      await userLogger.warning("Failed to fetch all reviews for charts", {}, allReviewsError);
    }

    // Przygotuj dane dla wykresów
    const activityChartData = prepareActivityChartData(allReviews || []);
    const accuracyChartData = prepareAccuracyChartData(sessions);
    const cardsDistribution = prepareCardsDistribution(newCards, learningCards, masteredCards);
    const tagDistribution = prepareTagDistribution(validTagsArrays);

    // Przygotuj obiekt statystyk zgodny z interfejsem DashboardStats
    const stats: DashboardStats = {
      // Podstawowe
      totalCards: totalCards || 0,
      lastReview: lastReview,
      accuracy: Math.round(accuracy),
      mostUsedTags: mostUsedTags,

      // Powtórki
      totalReviews: totalReviews || 0,
      averageAccuracy: averageAccuracy,
      longestStreak: longestStreak,
      cardsDueToday: cardsDueToday || 0,

      // SM-2
      averageEase: averageEase,
      averageInterval: averageInterval,
      newCards: newCards,
      learningCards: learningCards,
      masteredCards: masteredCards,

      // Czasowe
      cardsAddedThisWeek: cardsAddedThisWeek || 0,
      cardsAddedThisMonth: cardsAddedThisMonth || 0,
      activeDaysLast7Days: activeDaysLast7Days,
      activeDaysLast30Days: activeDaysLast30Days,
      mostActiveDayOfWeek: mostActiveDayOfWeek,

      // Dane dla wykresów (Faza 2)
      activityChartData: activityChartData,
      accuracyChartData: accuracyChartData,
      cardsDistribution: cardsDistribution,
      tagDistribution: tagDistribution,
    };

    await userLogger.info("Dashboard stats fetched successfully", {
      totalCards: stats.totalCards,
      totalReviews: stats.totalReviews,
      cardsDueToday: stats.cardsDueToday,
      newCards: stats.newCards,
      learningCards: stats.learningCards,
      masteredCards: stats.masteredCards,
    });

    // Zwróć statystyki z cache headers (Faza 3 - Optymalizacja)
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, max-age=300, stale-while-revalidate=600", // 5 min cache, 10 min stale
      },
    });
  } catch (error: any) {
    await logger.error("Dashboard stats fetch failed", {}, error);
    return new Response(JSON.stringify({ error: error.message || "Błąd pobierania statystyk" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
