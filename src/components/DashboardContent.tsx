import { useEffect, useState, lazy, Suspense } from "react";
import { supabase } from "../lib/supabase";
import { createClientLogger } from "../lib/logger-client";
import DashboardNav from "./DashboardNav";
import SkeletonLoader from "./SkeletonLoader";
import type { DashboardStats } from "../types";

// Lazy loading dla komponentów (Faza 3 - Optymalizacja)
const StatsCharts = lazy(() => import("./StatsCharts"));
const ReviewHistory = lazy(() => import("./ReviewHistory"));
const TagStats = lazy(() => import("./TagStats"));

export default function DashboardContent() {
  const [logger] = useState(() => createClientLogger({ component: "DashboardContent" }));
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    // Podstawowe
    totalCards: 0,
    lastReview: null,
    accuracy: 0,
    mostUsedTags: [],
    // Powtórki
    totalReviews: 0,
    averageAccuracy: 0,
    longestStreak: 0,
    cardsDueToday: 0,
    // SM-2
    averageEase: 0,
    averageInterval: 0,
    newCards: 0,
    learningCards: 0,
    masteredCards: 0,
    // Czasowe
    cardsAddedThisWeek: 0,
    cardsAddedThisMonth: 0,
    activeDaysLast7Days: 0,
    activeDaysLast30Days: 0,
    mostActiveDayOfWeek: null,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Pobierz token z sesji Supabase
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const redirectTo = encodeURIComponent("/dashboard");
        window.location.href = `/login?redirect=${redirectTo}`;
        return;
      }

      // AuthWrapper już sprawdził autentykację, więc możemy bezpiecznie pobrać statystyki
      const res = await fetch("/api/dashboard/stats", {
        method: "GET",
        credentials: "include", // Ważne: wysyłaj cookies
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Jeśli 401, przekieruj do logowania
          const redirectTo = encodeURIComponent("/dashboard");
          window.location.href = `/login?redirect=${redirectTo}`;
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Błąd HTTP: ${res.status}`);
      }

      const data = await res.json();

      // Walidacja danych API
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }

      // Walidacja wymaganych pól
      if (typeof data.totalCards !== "number") {
        throw new Error("Invalid totalCards in response");
      }

      setStats(data);
    } catch (err: any) {
      await logger.error("Failed to fetch dashboard stats", {}, err);
      setError(err.message || "Błąd podczas pobierania statystyk");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white text-lg">Ładowanie statystyk...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Błąd</p>
        <p className="text-sm">{error}</p>
        <button onClick={fetchStats} className="mt-2 text-sm underline hover:no-underline">
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Podstawowe statystyki */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Twoje statystyki</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Licznik fiszek */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📚</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Wszystkie fiszki</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
                  <p className="text-xs text-gray-500">łącznie</p>
                </div>
              </div>
            </div>

            {/* Fiszki do powtórki dzisiaj */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⏰</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Do powtórki</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cardsDueToday}</p>
                  <p className="text-xs text-gray-500">dzisiaj</p>
                </div>
              </div>
            </div>

            {/* Ostatnia powtórka */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Ostatnia powtórka</p>
                  <p className="text-sm font-bold text-gray-900 break-words">
                    {stats.lastReview || "Jeszcze nie zacząłeś"}
                  </p>
                  <p className="text-xs text-gray-500"></p>
                </div>
              </div>
            </div>

            {/* Poprawność */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Poprawność</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
                  <p className="text-xs text-gray-500">ostatnia sesja</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statystyki powtórek */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Postępy w nauce</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Łączna liczba powtórek */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔄</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Powtórek</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                  <p className="text-xs text-gray-500">łącznie</p>
                </div>
              </div>
            </div>

            {/* Średnia poprawność */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Średnia poprawność</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageAccuracy.toFixed(1)}%</p>
                  <p className="text-xs text-gray-500">wszystkie sesje</p>
                </div>
              </div>
            </div>

            {/* Najdłuższa seria */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔥</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Najdłuższa seria</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.longestStreak}</p>
                  <p className="text-xs text-gray-500">dni z rzędu</p>
                </div>
              </div>
            </div>

            {/* Aktywność ostatnio */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📈</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Aktywność</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.activeDaysLast7Days}/{stats.activeDaysLast30Days}
                  </p>
                  <p className="text-xs text-gray-500">dni (7/30 dni)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rozkład fiszek (SM-2) */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Rozkład fiszek wg zaawansowania</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Fiszki nowe */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🆕</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Nowe</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.newCards}</p>
                  <p className="text-xs text-gray-500">nie powtarzane</p>
                </div>
              </div>
            </div>

            {/* Fiszki w nauce */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📖</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">W nauce</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.learningCards}</p>
                  <p className="text-xs text-gray-500">{"<"} 30 dni interwał</p>
                </div>
              </div>
            </div>

            {/* Fiszki opanowane */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Opanowane</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.masteredCards}</p>
                  <p className="text-xs text-gray-500">{">="} 30 dni interwał</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Średni ease factor */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 border border-violet-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Średni ease factor</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageEase}</p>
                  <p className="text-xs text-gray-500">łatwość zapamiętania</p>
                </div>
              </div>
            </div>

            {/* Średni interwał */}
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🕐</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Średni interwał</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageInterval.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">dni</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statystyki czasowe */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Aktywność w czasie</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fiszki dodane w tym tygodniu */}
            <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-xl p-4 border border-lime-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Dodane w tym tygodniu</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cardsAddedThisWeek}</p>
                  <p className="text-xs text-gray-500">fiszek</p>
                </div>
              </div>
            </div>

            {/* Fiszki dodane w tym miesiącu */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📆</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Dodane w tym miesiącu</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cardsAddedThisMonth}</p>
                  <p className="text-xs text-gray-500">fiszek</p>
                </div>
              </div>
            </div>

            {/* Najaktywniejszy dzień tygodnia */}
            <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-xl p-4 border border-fuchsia-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌟</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Najaktywniejszy dzień</p>
                  <p className="text-lg font-bold text-gray-900 break-words">
                    {stats.mostActiveDayOfWeek || "Brak danych"}
                  </p>
                  <p className="text-xs text-gray-500">tygodnia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wykresy (Faza 2) - Lazy loaded */}
      {stats.activityChartData &&
        stats.accuracyChartData &&
        stats.cardsDistribution &&
        stats.tagDistribution && (
          <Suspense fallback={<SkeletonLoader type="chart" />}>
            <StatsCharts
              activityData={stats.activityChartData}
              accuracyData={stats.accuracyChartData}
              distributionData={stats.cardsDistribution}
              tagData={stats.tagDistribution}
            />
          </Suspense>
        )}

      {/* Historia powtórek (Faza 2) - Lazy loaded */}
      <Suspense fallback={<SkeletonLoader type="table" />}>
        <ReviewHistory />
      </Suspense>

      {/* Statystyki tagów (Faza 3) - Lazy loaded */}
      <Suspense fallback={<SkeletonLoader type="default" />}>
        <TagStats />
      </Suspense>

      {/* Tags Section */}
      {stats.mostUsedTags.length > 0 && (
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Najczęstsze tagi</h2>
            <div className="flex flex-wrap gap-2">
              {stats.mostUsedTags.map((tag) => (
                <span key={tag} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation Buttons */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-white">Szybkie akcje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardNav
            href="/generate"
            icon="🤖"
            title="Generator AI"
            description="Wygeneruj fiszki za pomocą AI z wklejonego tekstu"
          />
          <DashboardNav
            href="/flashcards"
            icon="📝"
            title="Moje fiszki"
            description="Przeglądaj, edytuj i zarządzaj swoimi fiszkami"
          />
          <DashboardNav
            href="/review"
            icon="🔄"
            title="Rozpocznij powtórkę"
            description="Powtarzaj fiszki i utrwalaj wiedzę"
          />
        </div>
      </section>
    </>
  );
}
