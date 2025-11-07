# Instrukcje: Etap 2 - Baza danych i Supabase

## Krok 1: Utworzenie projektu Supabase

1. Przejdź na [supabase.com](https://supabase.com)
2. Kliknij "Start your project" i zaloguj się (możesz użyć GitHub)
3. Kliknij "New Project"
4. Wypełnij formularz:
   - **Name:** `10xcards` (lub dowolna nazwa)
   - **Database Password:** Wygeneruj silne hasło (zapisz je!)
   - **Region:** Wybierz najbliższą (np. `West Europe`)
   - **Pricing Plan:** Free
5. Kliknij "Create new project" i poczekaj 2-3 minuty

## Krok 2: Pobranie kluczy API

1. W dashboardzie projektu, przejdź do: **Settings** → **API**
2. Skopiuj następujące wartości:
   - **Project URL** → to będzie `PUBLIC_SUPABASE_URL`
   - **anon public** key → to będzie `PUBLIC_SUPABASE_ANON_KEY`

## Krok 3: Aktualizacja pliku .env

Otwórz plik `.env` i zaktualizuj wartości:

```env
PUBLIC_SUPABASE_URL=https://twoj-projekt-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key-tutaj
```

## Krok 4: Wykonanie migracji SQL

1. W Supabase Dashboard, kliknij **SQL Editor** w menu bocznym
2. Kliknij **New query**
3. Wykonaj migracje w kolejności (skopiuj zawartość każdego pliku i wykonaj):
   - `supabase/migrations/001_create_flashcards_table.sql`
   - `supabase/migrations/002_create_card_scheduling_table.sql`
   - `supabase/migrations/003_create_card_reviews_table.sql`
   - `supabase/migrations/004_create_review_sessions_table.sql`

## Krok 5: Weryfikacja

1. Przejdź do **Table Editor** i sprawdź czy wszystkie 4 tabele są widoczne
2. Uruchom serwer dev: `npm run dev`
3. Otwórz w przeglądarce: `http://localhost:4321/api/test-supabase`
4. Powinieneś zobaczyć: `{"success": true, "message": "Połączenie z Supabase działa!", ...}`

## Weryfikacja końcowa

- [ ] Projekt Supabase utworzony i dostępny
- [ ] Klucze API skopiowane i dodane do `.env`
- [ ] Wszystkie 4 tabele utworzone
- [ ] RLS włączone dla wszystkich tabel
- [ ] Test endpoint `/api/test-supabase` zwraca sukces

Po weryfikacji możesz usunąć plik `src/pages/api/test-supabase.ts`.

