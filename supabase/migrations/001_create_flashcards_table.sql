-- Tabela flashcards: główna tabela przechowująca fiszki użytkowników
CREATE TABLE IF NOT EXISTS public.flashcards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON public.flashcards USING GIN(tags);

-- Włączenie Row-Level Security
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- RLS Policies: użytkownik może tylko czytać/modyfikować swoje własne fiszki
CREATE POLICY "Users can read own flashcards"
  ON public.flashcards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own flashcards"
  ON public.flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcards"
  ON public.flashcards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own flashcards"
  ON public.flashcards FOR DELETE
  USING (auth.uid() = user_id);

-- Funkcja do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger dla automatycznej aktualizacji updated_at
CREATE TRIGGER update_flashcards_updated_at 
  BEFORE UPDATE ON public.flashcards 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

