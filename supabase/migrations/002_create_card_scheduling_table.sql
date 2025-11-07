-- Tabela card_scheduling: harmonogram powtórek dla każdej fiszki (algorytm SM-2 lite)
CREATE TABLE IF NOT EXISTS public.card_scheduling (
  card_id uuid NOT NULL,
  user_id uuid NOT NULL,
  ease smallint NOT NULL DEFAULT 250,
  interval_days smallint NOT NULL DEFAULT 0,
  repetitions smallint NOT NULL DEFAULT 0,
  due_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT card_scheduling_pkey PRIMARY KEY (card_id),
  CONSTRAINT card_scheduling_user_fk FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT card_scheduling_card_fk FOREIGN KEY (card_id) 
    REFERENCES public.flashcards(id) ON DELETE CASCADE
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS card_scheduling_user_due_idx 
  ON public.card_scheduling(user_id, due_at ASC);
CREATE INDEX IF NOT EXISTS card_scheduling_user_card_idx 
  ON public.card_scheduling(user_id, card_id);

-- Włączenie Row-Level Security
ALTER TABLE public.card_scheduling ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Card scheduling: select own"
  ON public.card_scheduling FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Card scheduling: upsert own"
  ON public.card_scheduling FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

