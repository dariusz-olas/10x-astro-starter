import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { createClientLogger } from "../lib/logger-client";
import type { TagStat } from "../types";

export default function TagStats() {
  const [logger] = useState(() => createClientLogger({ component: "TagStats" }));
  const [loading, setLoading] = useState(true);
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"cards" | "accuracy" | "due">("cards");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useState<string | null>(null);

  const fetchTagStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const redirectTo = encodeURIComponent("/dashboard");
        window.location.href = `/login?redirect=${redirectTo}`;
        return;
      }

      const res = await fetch("/api/dashboard/tag-stats", {
        method: "GET",
        credentials: "include",
        cache: "no-store", // Wyłącz cache przeglądarki - zawsze pobieraj świeże dane
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          const redirectTo = encodeURIComponent("/dashboard");
          window.location.href = `/login?redirect=${redirectTo}`;
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Błąd HTTP: ${res.status}`);
      }

      const data = await res.json();

      // Walidacja danych API
      if (!Array.isArray(data)) {
        throw new Error("Invalid response format - expected array");
      }

      setTagStats(data);
    } catch (err: unknown) {
      await logger.error("Failed to fetch tag stats", {}, err);
      setError(err instanceof Error ? err.message : "Błąd podczas pobierania statystyk tagów");
    } finally {
      setLoading(false);
    }
  }, [logger]);

  useEffect(() => {
    // Pobierz początkową sesję i ustaw userId
    const fetchInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        await fetchTagStats();
      }
    };

    fetchInitialSession();

    // Nasłuchuj zmian w sesji użytkownika
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const newUserId = session.user.id;
        // Jeśli userId się zmienił (np. przelogowanie), odśwież dane
        setUserId((prevUserId) => {
          if (prevUserId !== newUserId) {
            (async () => {
              await logger.info("User changed, refreshing tag stats", {
                oldUserId: prevUserId,
                newUserId: newUserId,
              });
              await fetchTagStats(); // Odśwież dane dla nowego użytkownika
            })();
            return newUserId;
          }
          return prevUserId;
        });
      } else {
        setUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTagStats, logger]);

  // Sortowanie
  const sortedStats = [...tagStats].sort((a, b) => {
    switch (sortBy) {
      case "cards":
        return b.cardCount - a.cardCount;
      case "accuracy":
        return b.averageAccuracy - a.averageAccuracy;
      case "due":
        return b.cardsDue - a.cardsDue;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Statystyki tagów</h2>
          <div className="text-center py-8 text-gray-600">Ładowanie statystyk tagów...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Statystyki tagów</h2>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Błąd</p>
            <p className="text-sm">{error}</p>
            <button onClick={fetchTagStats} className="mt-2 text-sm underline hover:no-underline">
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (tagStats.length === 0) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Statystyki tagów</h2>
          <div className="text-center py-8 text-gray-600">
            <p className="mb-2">Nie masz jeszcze żadnych tagów.</p>
            <p className="text-sm">Dodaj tagi do swoich fiszek, aby zobaczyć szczegółowe statystyki!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-gray-800">Statystyki tagów</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sortuj:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "cards" | "accuracy" | "due")}
              aria-label="Sortuj statystyki tagów"
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cards">Liczba fiszek</option>
              <option value="accuracy">Poprawność</option>
              <option value="due">Do powtórki</option>
            </select>
          </div>
        </div>

        {/* Grid kart tagów */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedStats.map((stat) => (
            <div key={stat.tag} className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow">
              {/* Nagłówek karty */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-semibold">
                  {stat.tag}
                </span>
                {stat.cardsDue > 0 && (
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    {stat.cardsDue} do powtórki
                  </span>
                )}
              </div>

              {/* Statystyki */}
              <div className="space-y-3">
                {/* Liczba fiszek */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Fiszki:</span>
                  <span className="text-lg font-bold text-gray-900">{stat.cardCount}</span>
                </div>

                {/* Poprawność */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Poprawność:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          stat.averageAccuracy >= 80
                            ? "bg-green-500"
                            : stat.averageAccuracy >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${stat.averageAccuracy}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{stat.averageAccuracy}%</span>
                  </div>
                </div>

                {/* Ostatnia powtórka */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ostatnia powtórka:</span>
                  <span className="text-xs text-gray-900">{stat.lastReview || "Brak"}</span>
                </div>
              </div>

              {/* Przycisk akcji */}
              {stat.cardsDue > 0 && (
                <a
                  href={`/review?tag=${encodeURIComponent(stat.tag)}`}
                  className="mt-4 block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Rozpocznij powtórkę
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
