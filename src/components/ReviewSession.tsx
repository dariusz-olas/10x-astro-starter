import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { createClientLogger } from "../lib/logger-client";

interface Card {
  id: string;
  front: string;
  back: string;
}

export default function ReviewSession() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [queue, setQueue] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    cardsCorrect: 0,
  });
  const [sessionSaved, setSessionSaved] = useState(false);
  const [hasTriedLoadMore, setHasTriedLoadMore] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const [logger] = useState(() => createClientLogger({ component: "ReviewSession" }));

  const loadQueue = useCallback(async (force = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    
    await logger.debug("loadQueue called", { force });
    
    // Get session and access token for authorization
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    
    if (sessionError) {
      await logger.error("Failed to get session", {}, sessionError);
      setQueue([]);
      return;
    }
    
    if (!session) {
      await logger.error("No session available", {});
      setQueue([]);
      return;
    }
    
    await logger.debug("Session retrieved", {
      hasAccessToken: !!session.access_token,
      userId: session.user.id,
    });
    
    const headers: HeadersInit = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
      await logger.debug("Authorization header added", {
        tokenLength: session.access_token.length,
        tokenPrefix: session.access_token.substring(0, 20) + "...",
      });
    } else {
      await logger.warning("No access token in session", {});
    }
    
    const url = force ? "/api/review/next?force=true" : "/api/review/next";
    await logger.debug("Fetching review cards", { url, force, hasAuth: !!headers.Authorization });
    
    try {
      const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
        signal: abortRef.current.signal,
      });
      
      await logger.debug("Fetch response received", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        await logger.error("Failed to load review queue", {
          force,
          status: res.status,
          statusText: res.statusText,
          errorText,
          url,
          hasAuth: !!headers.Authorization,
        }, new Error(errorText));
        setQueue([]);
        return;
      }
      
      const json = await res.json();
      const cards = Array.isArray(json.cards) ? json.cards : [];
      
      await logger.info("Review queue loaded successfully", {
        count: cards.length,
        force,
        url,
      });
      
      setQueue(cards);
      setAnswered(0);
      setFlipped(false);
      setSessionStats({ cardsReviewed: 0, cardsCorrect: 0 });
      setSessionSaved(false);
      
      // Jeśli próbowaliśmy załadować więcej kart i nadal nie ma kart, ustaw flagę
      if (force && cards.length === 0) {
        setHasTriedLoadMore(true);
        await logger.warning("No cards available even in force mode", {});
      } else if (cards.length > 0) {
        setHasTriedLoadMore(false);
      }
    } catch (error: any) {
      await logger.error("Exception during loadQueue", {
        force,
        url,
        errorMessage: error.message,
        errorName: error.name,
      }, error);
      setQueue([]);
    }
  }, [logger]);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        await logger.error("No session for review", {}, error);
        const redirectTo = encodeURIComponent("/review");
        window.location.href = `/login?redirect=${redirectTo}`;
        return;
      }
      const userLogger = logger.withContext({
        userId: session.user.id,
        userEmail: session.user.email,
      });
      setUser(session.user);
      await userLogger.info("Starting review session");
      await loadQueue();
      setLoading(false);
    })();
  }, [loadQueue, logger]);

  const current = useMemo(() => queue[0] || null, [queue]);

  const submitGrade = useCallback(
    async (grade: 0 | 1 | 2 | 3) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session || !current) return;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (session.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/review/submit", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ cardId: current.id, grade }),
      });

    if (!res.ok) {
      const errorText = await res.text();
      await logger.error("Failed to submit grade", { cardId: current.id, grade }, new Error(errorText));
      return;
    }
    
    await logger.info("Grade submitted", {
      cardId: current.id,
      grade,
      correct: grade >= 2,
    });
    
    // Aktualizuj statystyki sesji: grade >= 2 oznacza poprawną odpowiedź
    setSessionStats((prev) => ({
      cardsReviewed: prev.cardsReviewed + 1,
      cardsCorrect: prev.cardsCorrect + (grade >= 2 ? 1 : 0),
    }));
    
    setQueue((prev) => prev.slice(1));
    setAnswered((a) => a + 1);
    setFlipped(false);
    },
    [current, logger]
  );

  // Obsługa klawiatury
  useEffect(() => {
    if (!current) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      const k = e.key.toLowerCase();
      const map: Record<string, 0 | 1 | 2 | 3> = {
        "1": 0,
        a: 0,
        "2": 1,
        h: 1,
        "3": 2,
        g: 2,
        "4": 3,
        e: 3,
      };
      if (k in map) {
        e.preventDefault();
        submitGrade(map[k]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, submitGrade]);

  // Zapisz sesję gdy wszystkie karty zostały przejrzane
  useEffect(() => {
    const saveSession = async () => {
      if (queue.length === 0 && sessionStats.cardsReviewed > 0 && !sessionSaved) {
        setSessionSaved(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        try {
          const headers: HeadersInit = {
            "Content-Type": "application/json",
          };
          if (session.access_token) {
            headers.Authorization = `Bearer ${session.access_token}`;
          }

          const res = await fetch("/api/review/session-complete", {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({
              cardsReviewed: sessionStats.cardsReviewed,
              cardsCorrect: sessionStats.cardsCorrect,
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            await logger.error("Failed to save review session", {
              cardsReviewed: sessionStats.cardsReviewed,
              cardsCorrect: sessionStats.cardsCorrect,
            }, new Error(errorText));
          } else {
            await logger.info("Review session saved", {
              cardsReviewed: sessionStats.cardsReviewed,
              cardsCorrect: sessionStats.cardsCorrect,
            });
          }
        } catch (error) {
          await logger.error("Error saving review session", {
            cardsReviewed: sessionStats.cardsReviewed,
            cardsCorrect: sessionStats.cardsCorrect,
          }, error);
        }
      }
    };

    saveSession();
  }, [queue.length, sessionStats, sessionSaved, logger]);

  if (loading) {
    return <div className="py-12 text-center text-white">Ładowanie…</div>;
  }

  if (!user) {
    return null;
  }

  if (!current) {
    // Jeśli próbowaliśmy załadować więcej kart i nadal nie ma kart, pokaż komunikat
    if (hasTriedLoadMore && queue.length === 0) {
      return (
        <div className="mt-6">
          <div className="p-6 rounded-lg bg-gray-800 text-white">
            <div className="text-center">
              <div className="text-xl font-semibold mb-2">📚 Brak fiszek</div>
              <p className="text-gray-300 mb-4">
                Nie masz jeszcze żadnych fiszek do powtórki. Dodaj fiszki ręcznie lub wygeneruj je za pomocą AI.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/flashcards"
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Dodaj fiszki
                </a>
                <a
                  href="/generate"
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium"
                >
                  Generator AI
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Normalny komunikat gdy wszystkie należne karty zostały przejrzane
    return (
      <div className="mt-6">
        {answered > 0 && <div className="mb-2 text-sm text-gray-300">Odpowiedziano: {answered}</div>}
        <div className="p-6 rounded-lg bg-gray-800 text-white">
          <div className="text-center">
            <div className="text-xl font-semibold mb-2">🎉 Świetna robota!</div>
            <p className="text-gray-300 mb-4">
              Wszystkie należne fiszki zostały przejrzane. Możesz teraz odpocząć lub przejrzeć więcej kart, jeśli
              chcesz.
            </p>
            <button
              onClick={async () => {
                await logger.info("Button 'Przejrzyj więcej kart' clicked");
                setLoading(true);
                setHasTriedLoadMore(false); // Reset flagi przed próbą
                try {
                  await loadQueue(true); // force = true
                } catch (error) {
                  await logger.error("Error in button click handler", {}, error);
                  setHasTriedLoadMore(true); // Ustaw flagę jeśli był błąd
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
              data-testid="more-cards-button"
              disabled={loading}
            >
              {loading ? "Ładowanie..." : "Przejrzyj więcej kart"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {(answered > 0 || queue.length > 0) && (
        <div className="mb-2 text-sm text-gray-300">
          {answered > 0 && <span>Odpowiedziano: {answered}</span>}
          {answered > 0 && queue.length > 0 && <span> | </span>}
          {queue.length > 0 && <span>Pozostało: {queue.length}</span>}
        </div>
      )}
      <div className="p-6 rounded-lg bg-gray-800">
        <div className="text-lg whitespace-pre-wrap text-white mb-4">{!flipped ? current.front : current.back}</div>
        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white transition"
            onClick={() => submitGrade(0)}
          >
            Again (1/A)
          </button>
          <button
            className="px-3 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white transition"
            onClick={() => submitGrade(1)}
          >
            Hard (2/H)
          </button>
          <button
            className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white transition"
            onClick={() => submitGrade(2)}
          >
            Good (3/G)
          </button>
          <button
            className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition"
            onClick={() => submitGrade(3)}
          >
            Easy (4/E)
          </button>
          <button
            className="ml-auto px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white transition"
            onClick={() => setFlipped((f) => !f)}
          >
            {flipped ? "Pokaż front (Space)" : "Pokaż back (Space)"}
          </button>
        </div>
      </div>
    </div>
  );
}
