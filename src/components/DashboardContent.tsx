import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DashboardNav from './DashboardNav';

interface DashboardStats {
  totalCards: number;
  lastReview: string | null;
  accuracy: number;
  mostUsedTags: string[];
}

export default function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalCards: 0,
    lastReview: null,
    accuracy: 0,
    mostUsedTags: []
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // AuthWrapper już sprawdził autentykację, więc możemy bezpiecznie pobrać statystyki
      const res = await fetch('/api/dashboard/stats', {
        method: 'GET',
        credentials: 'include', // Ważne: wysyłaj cookies
      });

      if (!res.ok) {
        if (res.status === 401) {
          // Jeśli 401, przekieruj do logowania
          const redirectTo = encodeURIComponent('/dashboard');
          window.location.href = `/login?redirect=${redirectTo}`;
          return;
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Błąd HTTP: ${res.status}`);
      }

      const data = await res.json();
      setStats({
        totalCards: data.totalCards || 0,
        lastReview: data.lastReview || null,
        accuracy: data.accuracy || 0,
        mostUsedTags: data.mostUsedTags || []
      });
    } catch (err: any) {
      console.error('❌ Błąd pobierania statystyk:', err);
      setError(err.message || 'Błąd podczas pobierania statystyk');
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
        <button
          onClick={fetchStats}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Stats Section */}
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Twoje statystyki</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Licznik fiszek */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📚</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Masz</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
                  <p className="text-xs text-gray-500">fiszek</p>
                </div>
              </div>
            </div>

            {/* Ostatnia powtórka */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📅</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Ostatnia powtórka</p>
                  <p className="text-sm font-bold text-gray-900 break-words">
                    {stats.lastReview || 'Jeszcze nie zacząłeś'}
                  </p>
                  <p className="text-xs text-gray-500"></p>
                </div>
              </div>
            </div>

            {/* Poprawność */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Poprawność</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
                  <p className="text-xs text-gray-500">w ostatniej sesji</p>
                </div>
              </div>
            </div>

            {/* Aktywne tagi */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏷️</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">Aktywne tagi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.mostUsedTags.length}</p>
                  <p className="text-xs text-gray-500">do nauki</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tags Section */}
      {stats.mostUsedTags.length > 0 && (
        <section className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Najczęstsze tagi</h2>
            <div className="flex flex-wrap gap-2">
              {stats.mostUsedTags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
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

