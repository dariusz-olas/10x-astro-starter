import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { createClientLogger } from "../lib/logger-client";
import { formatDatePL } from "../lib/dateUtils";
import type { ReviewHistoryItem } from "../types";

export default function ReviewHistory() {
  const [logger] = useState(() => createClientLogger({ component: "ReviewHistory" }));
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<ReviewHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  const fetchHistory = async () => {
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

      const res = await fetch(`/api/dashboard/review-history?limit=${limit}`, {
        method: "GET",
        credentials: "include",
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

      setHistory(data);
    } catch (err: any) {
      await logger.error("Failed to fetch review history", {}, err);
      setError(err.message || "Błąd podczas pobierania historii");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Historia powtórek</h2>
          <div className="text-center py-8 text-gray-600">Ładowanie historii...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Historia powtórek</h2>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-semibold">Błąd</p>
            <p className="text-sm">{error}</p>
            <button onClick={fetchHistory} className="mt-2 text-sm underline hover:no-underline">
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (history.length === 0) {
    return (
      <section className="mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Historia powtórek</h2>
          <div className="text-center py-8 text-gray-600">
            <p className="mb-2">Jeszcze nie masz żadnych sesji powtórek.</p>
            <p className="text-sm">Rozpocznij swoją pierwszą powtórkę, aby zobaczyć historię!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Historia powtórek</h2>
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            aria-label="Liczba wyświetlanych sesji"
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">5 ostatnich</option>
            <option value="10">10 ostatnich</option>
            <option value="20">20 ostatnich</option>
            <option value="50">50 ostatnich</option>
          </select>
        </div>

        {/* Desktop: Tabela */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Powtórzono</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Poprawne</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Poprawność</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {formatDatePL(item.completedAt)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center">
                    {item.cardsReviewed}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 text-center">
                    {item.cardsCorrect}
                  </td>
                  <td className="py-3 px-4 text-sm text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        item.accuracy >= 80
                          ? "bg-green-100 text-green-800"
                          : item.accuracy >= 60
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.accuracy.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: Karty */}
        <div className="md:hidden space-y-4">
          {history.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm font-medium text-gray-700">
                  {formatDatePL(item.completedAt)}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.accuracy >= 80
                      ? "bg-green-100 text-green-800"
                      : item.accuracy >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {item.accuracy.toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Powtórzono:</span>
                  <span className="ml-1 font-medium text-gray-900">{item.cardsReviewed}</span>
                </div>
                <div>
                  <span className="text-gray-600">Poprawne:</span>
                  <span className="ml-1 font-medium text-gray-900">{item.cardsCorrect}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
