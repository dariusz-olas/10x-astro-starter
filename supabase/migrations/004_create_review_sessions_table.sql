-- Tabela review_sessions: podsumowania zakończonych sesji powtórek
CREATE TABLE IF NOT EXISTS public.review_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  cards_reviewed int NOT NULL,
  cards_correct int NOT NULL,
  accuracy numeric(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN cards_reviewed > 0 THEN (cards_correct::numeric / cards_reviewed::numeric * 100)
      ELSE 0
    END
  ) STORED,
  CONSTRAINT review_sessions_user_fk FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS review_sessions_user_id_idx 
  ON public.review_sessions(user_id);
CREATE INDEX IF NOT EXISTS review_sessions_completed_at_idx 
  ON public.review_sessions(user_id, completed_at DESC);

-- Włączenie Row-Level Security
ALTER TABLE public.review_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Review sessions: select own"
  ON public.review_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Review sessions: insert own"
  ON public.review_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

