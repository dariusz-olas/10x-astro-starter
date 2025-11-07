# Migracje SQL dla Supabase

Ten katalog zawiera migracje SQL dla bazy danych projektu 10xCards.

## Instrukcje wykonania migracji

1. **Zaloguj się do Supabase Dashboard:**
   - Przejdź na [supabase.com](https://supabase.com)
   - Otwórz swój projekt

2. **Otwórz SQL Editor:**
   - W menu bocznym kliknij **SQL Editor**
   - Kliknij **New query**

3. **Wykonaj migracje w kolejności:**
   - Skopiuj zawartość pliku `001_create_flashcards_table.sql` i wykonaj w SQL Editor
   - Skopiuj zawartość pliku `002_create_card_scheduling_table.sql` i wykonaj w SQL Editor
   - Skopiuj zawartość pliku `003_create_card_reviews_table.sql` i wykonaj w SQL Editor
   - Skopiuj zawartość pliku `004_create_review_sessions_table.sql` i wykonaj w SQL Editor

4. **Weryfikacja:**
   - Przejdź do **Table Editor** i sprawdź czy wszystkie 4 tabele są widoczne:
     - `flashcards`
     - `card_scheduling`
     - `card_reviews`
     - `review_sessions`
   - Sprawdź czy RLS (Row-Level Security) jest włączone dla wszystkich tabel

## Struktura tabel

### flashcards
Główna tabela przechowująca fiszki użytkowników.

### card_scheduling
Harmonogram powtórek dla każdej fiszki (algorytm SM-2 lite).

### card_reviews
Immutable historia wszystkich ocen odpowiedzi.

### review_sessions
Podsumowania zakończonych sesji powtórek.

## Bezpieczeństwo

Wszystkie tabele mają włączone Row-Level Security (RLS) i polityki bezpieczeństwa, które zapewniają, że użytkownicy mogą tylko czytać i modyfikować swoje własne dane.

