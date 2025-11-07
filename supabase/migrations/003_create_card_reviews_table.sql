-- Tabela card_reviews: immutable historia wszystkich ocen odpowiedzi
CREATE TABLE IF NOT EXISTS public.card_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_id uuid NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  grade smallint NOT NULL CHECK (grade BETWEEN 0 AND 3),
  prev_interval_days smallint,
  new_interval_days smallint,
  prev_ease smallint,
  new_ease smallint,
  CONSTRAINT card_reviews_user_fk FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS card_reviews_user_time_idx 
  ON public.card_reviews(user_id, reviewed_at DESC);
CREATE INDEX IF NOT EXISTS card_reviews_user_card_idx 
  ON public.card_reviews(user_id, card_id);

-- Włączenie Row-Level Security
ALTER TABLE public.card_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies (append-only: tylko INSERT i SELECT)
CREATE POLICY "Card reviews: select own"
  ON public.card_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Card reviews: insert own"
  ON public.card_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

