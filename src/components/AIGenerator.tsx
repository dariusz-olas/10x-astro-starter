import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { createClientLogger } from "../lib/logger-client";

interface GeneratedFlashcard {
  front: string;
  back: string;
}

export default function AIGenerator() {
  const [text, setText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [flashcards, setFlashcards] = useState<GeneratedFlashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [logger] = useState(() => createClientLogger({ component: "AIGenerator" }));

  // Get user context when component mounts
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        logger.withContext({
          userId: session.user.id,
          userEmail: session.user.email,
        });
      }
    });
  }, [logger]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setFlashcards([]);
    setSelectedCards(new Set());
    setSuccess(null);

    try {
      await logger.info("Starting flashcard generation", { textLength: text.length });

      // Pobierz sesję i token przed wysłaniem requestu
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        const error = new Error("Musisz być zalogowany aby generować fiszki");
        await logger.error("Unauthorized flashcard generation attempt", {}, error);
        throw error;
      }

      const userLogger = logger.withContext({
        userId: session.user.id,
        userEmail: session.user.email,
      });

      const response = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Błąd: ${response.status}`);
      }

      const data = await response.json();
      const generatedCards = data.flashcards || [];
      setFlashcards(generatedCards);

      await userLogger.info("Flashcards generated successfully", {
        count: generatedCards.length,
      });

      // Automatycznie zaznacz wszystkie
      setSelectedCards(new Set(generatedCards.map((_, idx: number) => idx)));
    } catch (err: unknown) {
      await logger.error(
        "Flashcard generation failed",
        {
          textLength: text.length,
        },
        err
      );
      setError(err.message || "Błąd podczas generowania fiszek");
    } finally {
      setGenerating(false);
    }
  };

  const toggleCard = (index: number) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCards(newSelected);
  };

  const selectAll = () => {
    setSelectedCards(new Set(flashcards.map((_, idx) => idx)));
  };

  const deselectAll = () => {
    setSelectedCards(new Set());
  };

  const handleSave = async () => {
    if (selectedCards.size === 0) {
      setError("Wybierz przynajmniej jedną fiszkę do zapisania");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Pobierz aktualnego użytkownika
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Musisz być zalogowany aby zapisać fiszki");
      }

      // Przygotuj fiszki do zapisania
      const cardsToSave = flashcards.filter((_, idx) => selectedCards.has(idx));

      const { error: insertError } = await supabase.from("flashcards").insert(
        cardsToSave.map((card) => ({
          user_id: session.user.id,
          front: card.front,
          back: card.back,
          tags: [],
        }))
      );

      if (insertError) {
        await logger.error(
          "Failed to save flashcards",
          {
            count: cardsToSave.length,
          },
          insertError
        );
        throw insertError;
      }

      await logger.info("Flashcards saved successfully", {
        count: cardsToSave.length,
      });

      setSuccess(`Zapisano ${cardsToSave.length} fiszek!`);

      // Wyczyść formularz i wyniki po 2 sekundach
      setTimeout(() => {
        setText("");
        setFlashcards([]);
        setSelectedCards(new Set());
        setSuccess(null);
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Błąd podczas zapisywania fiszek");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Formularz */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Wklej tekst</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki..."
            />
            <p className="mt-2 text-sm text-gray-500">AI przeanalizuje tekst i wygeneruje 5-15 fiszek edukacyjnych</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={generating || !text.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
          >
            {generating ? "⚡ Generowanie..." : "🤖 Generuj fiszki"}
          </button>
        </form>
      </div>

      {/* Wyniki */}
      {flashcards.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Wygenerowane fiszki ({flashcards.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
              >
                Zaznacz wszystkie
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                Odznacz wszystkie
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {flashcards.map((card, index) => (
              <div
                key={index}
                className={`border-2 rounded-xl p-4 transition ${
                  selectedCards.has(index) ? "border-purple-500 bg-purple-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedCards.has(index)}
                    onChange={() => toggleCard(index)}
                    className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 font-medium">Pytanie:</span>
                      <p className="font-semibold text-gray-900 mt-1">{card.front}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 font-medium">Odpowiedź:</span>
                      <p className="text-gray-700 mt-1">{card.back}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving || selectedCards.size === 0}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50"
          >
            {saving ? "💾 Zapisywanie..." : `✅ Zapisz wybrane (${selectedCards.size}/${flashcards.length})`}
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {generating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="text-4xl mb-4 animate-bounce">⚡</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Generowanie fiszek...</h3>
            <p className="text-gray-600">To może chwilę potrwać</p>
          </div>
        </div>
      )}
    </div>
  );
}
