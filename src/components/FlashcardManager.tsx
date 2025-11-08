import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Flashcard } from "../types";
import { createClientLogger } from "../lib/logger-client";

interface FlashcardManagerProps {
  userId: string;
}

export default function FlashcardManager({ userId }: FlashcardManagerProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [formData, setFormData] = useState({
    front: "",
    back: "",
    tags: "",
  });
  const [logger] = useState(() => createClientLogger({ component: "FlashcardManager", userId }));

  const refreshFlashcards = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFlashcards(data || []);
      await logger.info("Flashcards loaded", { count: (data || []).length });
    } catch (err: any) {
      await logger.error("Failed to load flashcards", {}, err);
      setError(err.message || "Błąd podczas pobierania fiszek");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFlashcards();
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Konwersja tagów z stringa na array
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const { error } = await supabase.from("flashcards").insert({
        user_id: userId,
        front: formData.front,
        back: formData.back,
        tags: tagsArray,
      });

      if (error) throw error;

      await logger.info("Flashcard added", {
        frontLength: formData.front.length,
        backLength: formData.back.length,
        tagsCount: tagsArray.length,
      });

      // Reset form
      setFormData({ front: "", back: "", tags: "" });
      setShowAddForm(false);
      await refreshFlashcards();
    } catch (err: any) {
      await logger.error("Failed to add flashcard", {}, err);
      setError(err.message || "Błąd podczas dodawania fiszki");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
    setFormData({
      front: card.front,
      back: card.back,
      tags: card.tags.join(", "),
    });
    setShowAddForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    setLoading(true);
    setError(null);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const { error } = await supabase
        .from("flashcards")
        .update({
          front: formData.front,
          back: formData.back,
          tags: tagsArray,
        })
        .eq("id", editingCard.id)
        .eq("user_id", userId);

      if (error) throw error;

      await logger.info("Flashcard updated", { cardId: editingCard.id });

      // Reset form
      setFormData({ front: "", back: "", tags: "" });
      setEditingCard(null);
      setShowAddForm(false);
      await refreshFlashcards();
    } catch (err: any) {
      await logger.error("Failed to update flashcard", { cardId: editingCard.id }, err);
      setError(err.message || "Błąd podczas aktualizacji fiszki");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tę fiszkę?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("flashcards").delete().eq("id", id).eq("user_id", userId);

      if (error) throw error;
      await logger.info("Flashcard deleted", { cardId: id });
      await refreshFlashcards();
    } catch (err: any) {
      await logger.error("Failed to delete flashcard", { cardId: id }, err);
      setError(err.message || "Błąd podczas usuwania fiszki");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

      {/* Header with Add button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Wszystkie fiszki ({flashcards.length})</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingCard(null);
            setFormData({ front: "", back: "", tags: "" });
          }}
          className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg"
        >
          {showAddForm ? "Anuluj" : "+ Dodaj fiszkę"}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingCard ? "Edytuj fiszkę" : "Dodaj nową fiszkę"}
          </h3>
          <form onSubmit={editingCard ? handleUpdate : handleAdd} className="space-y-4">
            <div>
              <label htmlFor="front" className="block text-sm font-medium text-gray-700 mb-2">
                Pytanie (przód)
              </label>
              <textarea
                id="front"
                value={formData.front}
                onChange={(e) => setFormData({ ...formData, front: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Wpisz pytanie..."
              />
            </div>
            <div>
              <label htmlFor="back" className="block text-sm font-medium text-gray-700 mb-2">
                Odpowiedź (tył)
              </label>
              <textarea
                id="back"
                value={formData.back}
                onChange={(e) => setFormData({ ...formData, back: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Wpisz odpowiedź..."
              />
            </div>
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tagi (oddzielone przecinkami)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="np. Gramatyka, Słownictwo"
              />
              <p className="mt-1 text-xs text-gray-500">Wpisz tagi oddzielone przecinkami (opcjonalnie, max 5 tagów)</p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Zapisywanie..." : editingCard ? "Zapisz zmiany" : "Dodaj fiszkę"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCard(null);
                  setFormData({ front: "", back: "", tags: "" });
                }}
                className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading && !showAddForm && <div className="text-center text-white py-8">Ładowanie...</div>}

      {/* Flashcard List */}
      {flashcards.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Brak fiszek</h3>
          <p className="text-gray-600">Dodaj swoją pierwszą fiszkę!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Pytanie:</div>
                <div className="font-semibold text-gray-900">{card.front}</div>
              </div>
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Odpowiedź:</div>
                <div className="text-gray-700">{card.back}</div>
              </div>
              {card.tags && card.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {card.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(card)}
                  className="flex-1 bg-blue-50 text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition text-sm"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="flex-1 bg-red-50 text-red-600 font-medium px-4 py-2 rounded-lg hover:bg-red-100 transition text-sm"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
