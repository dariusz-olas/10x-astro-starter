# 10xCards - Product Requirements Document (PRD)

## 🎯 Problem
Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne i żmudne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition.

## 📦 MVP - Co wchodzi w zakres

### 1. Autentykacja (wymagane dla certyfikatu)
- Rejestracja użytkownika (email + hasło)
- Logowanie
- Wylogowanie
- Session management

### 2. CRUD dla fiszek (wymagane dla certyfikatu)
- Wyświetlanie listy wszystkich fiszek użytkownika
- Ręczne dodawanie nowej fiszki (front + back)
- Edycja istniejącej fiszki
- Usuwanie fiszki
- Każda fiszka może mieć 1-5 tagów (prosty system tagów)

### 3. Generator fiszek AI (wymagane dla certyfikatu)
- Wklejenie tekstu przez użytkownika
- AI generuje 5-15 fiszek na podstawie tekstu
- User review - widzi wygenerowane fiszki i wybiera które chce zapisać
- Wybrane fiszki są zapisywane w bazie

### 4. System powtórek z algorytmem SM-2 lite (funkcja z logiką biznesową)
- User wybiera: "Rozpocznij powtórkę"
- System automatycznie wybiera fiszki należne do powtórki (na podstawie algorytmu SM-2 lite)
- Wyświetla fiszki po kolei:
  - Pytanie (front)
  - Przycisk "Pokaż odpowiedź"
  - Odpowiedź (back) + przyciski oceny: "Again (0)", "Hard (1)", "Good (2)", "Easy (3)"
- Algorytm SM-2 lite oblicza interwały powtórek na podstawie ocen
- Prosty licznik na końcu: "X/Y poprawnych"
- Statystyki są zapisywane (review_sessions)

### 5. Dashboard z statystykami
- Główny licznik: "Masz X fiszek"
- "Ostatnia powtórka: [data]"
- "Najczęstsze tagi: [lista]"
- Statystyka: "Poprawność: X% w ostatniej sesji"

## ❌ Co NIE wchodzi w zakres MVP

- ~~Zaawansowany algorytm SM-2 (spaced repetition)~~ ✅ **Zaimplementowano:** Algorytm SM-2 lite jest częścią MVP
- ~~Interwały, ease_factor, overdue~~ ✅ **Zaimplementowano:** System interwałów i ease factor jest częścią MVP
- Hierarchiczna struktura tagów
- Osobne zarządzanie taliami (używamy tylko tagów)
- Współdzielenie fiszek między użytkownikami
- Import/export fiszek
- Aplikacja mobilna (tylko web)
- Multimedialne fiszki (zdjęcia, audio)
- Zaawansowana analityka

## 🎯 Kryteria sukcesu

### Dla certyfikatu:
1. ✅ Auth działa poprawnie
2. ✅ CRUD dla fiszek działa
3. ✅ Generator AI działa i zapisuje fiszki
4. ✅ Powtórki działają (wyświetlanie, odpowiadanie, licznik)
5. ✅ Dashboard pokazuje podstawowe statystyki

### Dla produktu:
- 80% wygenerowanych przez AI fiszek jest akceptowanych przez użytkownika
- Użytkownicy tworzą 75% fiszek z wykorzystaniem AI
- Użytkownicy używają powtórek średnio 3x w tygodniu

## 👤 User Stories

### US-1: Rejestracja i logowanie
**Jako** nowy użytkownik, **chcę** móc zarejestrować się i zalogować, **aby** móc korzystać z aplikacji i przechowywać swoje fiszki.

**Kryteria akceptacji:**
- Formularz rejestracji wymaga email i hasło (z potwierdzeniem)
- Po rejestracji użytkownik jest automatycznie zalogowany
- Formularz logowania pozwala na dostęp do istniejącego konta
- Obie formularze obsługują błędy walidacji

### US-2: Ręczne tworzenie fiszek
**Jako** użytkownik, **chcę** móc ręcznie tworzyć fiszki (pytanie + odpowiedź) i przypisywać im tagi, **aby** dodać custom fiszki do systemu.

**Kryteria akceptacji:**
- Formularz ma pola: front (pytanie), back (odpowiedź), tagi (opcjonalnie)
- User może przypisać 1-5 tagów do fiszki
- Po zapisaniu fiszka pojawia się na liście
- User może edytować lub usunąć fiszkę

### US-3: Generator AI
**Jako** użytkownik, **chcę** wkleić tekst i wygenerować fiszki przez AI, **aby** szybko utworzyć wiele fiszek z materiału źródłowego.

**Kryteria akceptacji:**
- Formularz przyjmuje tekst (dowolna długość)
- AI generuje 5-15 fiszek (zależnie od długości tekstu)
- User widzi wszystkie wygenerowane fiszki do review
- User wybiera checkbox obok tych, które chce zapisać
- Wybrane fiszki są zapisywane w bazie

### US-4: Wyświetlanie fiszek
**Jako** użytkownik, **chcę** widzieć listę wszystkich moich fiszek z możliwością filtrowania po tagach, **aby** zarządzać swoimi zasobami.

**Kryteria akceptacji:**
- Lista pokazuje wszystkie fiszki użytkownika
- Filtrowanie po tagach (multi-select)
- Responsywny design
- Możliwość edycji i usuwania z listy

### US-5: Powtórki z algorytmem SM-2 lite
**Jako** użytkownik, **chcę** powtarzać swoje fiszki używając algorytmu spaced repetition, **aby** efektywnie utrwalać wiedzę.

**Kryteria akceptacji:**
- User wybiera "Rozpocznij powtórkę"
- System automatycznie wybiera fiszki należne do powtórki (na podstawie due_at z algorytmu SM-2 lite)
- Wyświetla fiszki po kolei (pytanie → odpowiedź)
- Przyciski oceny: "Again (0)", "Hard (1)", "Good (2)", "Easy (3)" rejestrują odpowiedź
- Algorytm SM-2 lite oblicza interwały powtórek na podstawie ocen
- Na końcu widzi: "X/Y poprawnych" oraz statystyki sesji
- Statystyki są zapisywane w review_sessions
- Historia ocen jest zapisywana w card_reviews (immutable)

### US-6: Dashboard
**Jako** użytkownik, **chcę** widzieć statystyki moich postępów, **aby** śledzić swoją aktywność.

**Kryteria akceptacji:**
- Główny licznik: "Masz X fiszek"
- "Ostatnia powtórka: [data]"
- "Najczęstsze tagi"
- "Poprawność w ostatniej sesji: X%"

## 🏗️ Tech Stack

- **Frontend:** Astro + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL database)
- **Auth:** Supabase Auth
- **AI:** OpenRouter (dostep do różnych modeli)
- **Testing:** Vitest (unit tests)
- **CI/CD:** GitHub Actions
- **Deployment:** Cloudflare Pages

## 📊 Architektura (wysokopoziomowo)

### Baza danych (Supabase):
```sql
flashcards (
  id: uuid (PK)
  user_id: uuid (FK do auth.users)
  front: text
  back: text
  tags: text[] (array tagów)
  created_at: timestamptz
  updated_at: timestamptz
)

card_scheduling (
  card_id: uuid (PK, FK do flashcards)
  user_id: uuid (FK do auth.users)
  ease: smallint (domyślnie 250)
  interval_days: smallint (domyślnie 0)
  repetitions: smallint (domyślnie 0)
  due_at: timestamptz (data następnej powtórki)
  updated_at: timestamptz
)

card_reviews (
  id: uuid (PK)
  user_id: uuid (FK do auth.users)
  card_id: uuid (FK do flashcards)
  reviewed_at: timestamptz
  grade: smallint (0-3: Again, Hard, Good, Easy)
  prev_interval_days: smallint
  new_interval_days: smallint
  prev_ease: smallint
  new_ease: smallint
)

review_sessions (
  id: uuid (PK)
  user_id: uuid (FK do auth.users)
  completed_at: timestamptz
  cards_reviewed: int
  cards_correct: int
  accuracy: numeric(5,2) (computed column: cards_correct/cards_reviewed * 100)
)
```

### Struktura katalogów:
```
10xcards-app/
├── src/
│   ├── pages/
│   │   ├── login.astro
│   │   ├── register.astro
│   │   ├── dashboard.astro
│   │   ├── flashcards.astro
│   │   ├── review.astro
│   │   ├── generate.astro
│   │   ├── index.astro
│   │   └── api/ (endpointy API)
│   ├── components/
│   │   ├── AuthWrapper.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── FlashcardManager.tsx
│   │   ├── FlashcardManagerWrapper.tsx
│   │   ├── AIGenerator.tsx
│   │   ├── ReviewSession.tsx
│   │   ├── DashboardContent.tsx
│   │   ├── DashboardNav.tsx
│   │   ├── LogoutButton.tsx
│   │   └── ui/ (komponenty shadcn/ui)
│   ├── lib/
│   │   ├── supabase.ts (client-side)
│   │   ├── openrouter.ts
│   │   ├── scheduling.ts (algorytm SM-2 lite)
│   │   └── dateUtils.ts
│   ├── db/
│   │   └── supabase-server.ts (server-side)
│   ├── hooks/
│   │   └── useAuth.ts
│   └── types.ts
├── supabase/
│   └── migrations/ (migracje SQL)
├── .ai/ (dokumentacja planistyczna)
├── tests/
└── .github/workflows/
```

## 🧪 Wymagania testowe (dla certyfikatu)

- **Jeden działający test:**
  - Opcja A: Unit test funkcji parsowania odpowiedzi AI
  - Opcja B: E2E test przepływu: rejestracja → login → dodaj fiszkę

## 🚀 Wymagania deployment (dla certyfikatu)

- **CI/CD:**
  - GitHub Actions workflow
  - Automatyczne uruchamianie testów na push

- **Production:**
  - Wdrożenie na Cloudflare Pages
  - Publiczny URL działający
  - Supabase skonfigurowany dla produkcji
  - Zmienne środowiskowe skonfigurowane w Cloudflare Pages Dashboard

---

**Status:** Draft  
**Wersja:** 1.0  
**Data:** ${today}
