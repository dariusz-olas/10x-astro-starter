import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type Card = { id: string; front: string; back: string };

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
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        const redirectTo = encodeURIComponent('/review');
        window.location.href = `/login?redirect=${redirectTo}`;
        return;
      }
      setUser(session.user);
      await loadQueue();
      setLoading(false);
    })();
  }, []);

  const loadQueue = async (force: boolean = false) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const url = force ? '/api/review/next?force=true' : '/api/review/next';
    const res = await fetch(url, {
      method: 'GET',
      signal: abortRef.current.signal,
    });
    if (!res.ok) {
      console.error('Błąd pobierania kart:', await res.text());
      setQueue([]);
      return;
    }
    const json = await res.json();
    setQueue(Array.isArray(json.cards) ? json.cards : []);
    setAnswered(0);
    setFlipped(false);
    setSessionStats({ cardsReviewed: 0, cardsCorrect: 0 });
    setSessionSaved(false);
  };

  const current = useMemo(() => queue[0] || null, [queue]);

  const submitGrade = useCallback(async (grade: 0 | 1 | 2 | 3) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session || !current) return;
    
    const res = await fetch('/api/review/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardId: current.id, grade }),
    });
    
    if (!res.ok) {
      console.error('Błąd zapisu odpowiedzi:', await res.text());
      return;
    }
    
    // Aktualizuj statystyki sesji: grade >= 2 oznacza poprawną odpowiedź
    setSessionStats((prev) => ({
      cardsReviewed: prev.cardsReviewed + 1,
      cardsCorrect: prev.cardsCorrect + (grade >= 2 ? 1 : 0),
    }));
    
    setQueue((prev) => prev.slice(1));
    setAnswered((a) => a + 1);
    setFlipped(false);
  }, [current]);

  // Obsługa klawiatury
  useEffect(() => {
    if (!current) return;
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      const k = e.key.toLowerCase();
      const map: Record<string, 0 | 1 | 2 | 3> = {
        '1': 0,
        a: 0,
        '2': 1,
        h: 1,
        '3': 2,
        g: 2,
        '4': 3,
        e: 3,
      };
      if (k in map) {
        e.preventDefault();
        submitGrade(map[k]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
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
          const res = await fetch('/api/review/session-complete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cardsReviewed: sessionStats.cardsReviewed,
              cardsCorrect: sessionStats.cardsCorrect,
            }),
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error('Błąd zapisu sesji:', errorText);
          }
        } catch (error) {
          console.error('Błąd zapisu sesji powtórek:', error);
        }
      }
    };

    saveSession();
  }, [queue.length, sessionStats, sessionSaved]);

  if (loading) {
    return <div className="py-12 text-center text-white">Ładowanie…</div>;
  }
  
  if (!user) {
    return null;
  }
  
  if (!current) {
    return (
      <div className="mt-6">
        {answered > 0 && (
          <div className="mb-2 text-sm text-gray-300">Odpowiedziano: {answered}</div>
        )}
        <div className="p-6 rounded-lg bg-gray-800 text-white">
          <div className="text-center">
            <div className="text-xl font-semibold mb-2">🎉 Świetna robota!</div>
            <p className="text-gray-300 mb-4">
              Wszystkie należne fiszki zostały przejrzane. Możesz teraz odpocząć lub przejrzeć więcej kart, jeśli chcesz.
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                await loadQueue(true); // force = true
                setLoading(false);
              }}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Przejrzyj więcej kart
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
        <div className="text-lg whitespace-pre-wrap text-white mb-4">
          {!flipped ? current.front : current.back}
        </div>
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
            {flipped ? 'Pokaż front (Space)' : 'Pokaż back (Space)'}
          </button>
        </div>
      </div>
    </div>
  );
}

