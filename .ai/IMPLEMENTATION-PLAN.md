# Plan Implementacji 10xCards - Certyfikacja 10xDevs

> **Status:** ✅ GOTOWY DO UŻYCIA  
> **Ostatnia aktualizacja:** 2025-01-27  
> **Wersja:** 2.0.0 (Wszystkie etapy uzupełnione)

---

## 📋 Przegląd

### Cel projektu

**10xCards** to aplikacja webowa do generowania i nauki fiszek edukacyjnych wspomagana przez AI. Projekt jest realizowany jako **Proof of Concept (POC)** dla certyfikacji 10xDevs.

**Główny problem do rozwiązania:**
Manualne tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne i żmudne, co zniechęca do korzystania z efektywnej metody nauki jaką jest spaced repetition.

**Kluczowe funkcjonalności:**
- Generowanie fiszek przez AI na podstawie wprowadzonego tekstu
- Ręczne tworzenie, edycja i zarządzanie fiszkami
- System powtórek z algorytmem spaced repetition (SM-2 lite)
- Dashboard ze statystykami nauki
- System tagów do organizacji fiszek

**Cel certyfikacji:**
- Uzyskanie certyfikatu 10xDevs
- Demonstracja umiejętności pracy z AI (Cursor IDE)
- Praktyczne zastosowanie nowoczesnego stacku technologicznego
- Stworzenie działającego narzędzia do nauki

### Wymagania certyfikacyjne

Aplikacja **MUSI** zawierać następujące elementy (wszystkie są wymagane):

#### 1. ✅ Autentykacja użytkownika (Auth)
- Rejestracja użytkownika (email + hasło)
- Logowanie
- Wylogowanie
- Zarządzanie sesją użytkownika
- Chronione trasy wymagające autentykacji

#### 2. ✅ Funkcja CRUD
- Wyświetlanie listy wszystkich fiszek użytkownika
- Ręczne tworzenie nowej fiszki (front + back)
- Edycja istniejącej fiszki
- Usuwanie fiszki
- System tagów (1-5 tagów na fiszkę, opcjonalnie)

#### 3. ✅ Funkcja z LLM (AI)
- Generator fiszek wykorzystujący AI (OpenRouter)
- Użytkownik wkleja tekst źródłowy
- AI generuje 5-15 fiszek edukacyjnych
- User review - wybór które fiszki zapisać
- Zapisywanie wybranych fiszek do bazy danych

#### 4. ✅ Funkcja z logiką biznesową
- System powtórek (spaced repetition) z algorytmem SM-2 lite
- Wyświetlanie należnych kart do powtórki
- Ocena odpowiedzi użytkownika (Again/Hard/Good/Easy)
- Automatyczna aktualizacja harmonogramu powtórek
- Zapisywanie historii i statystyk sesji

#### 5. ✅ Testy
- Przynajmniej jeden działający test
- **Unit test** (Vitest) - testujący konkretną funkcję (np. algorytm scheduling)
- **LUB** **E2E test** (Playwright) - testujący przepływ użytkownika
- Testy muszą przechodzić (`npm test`)

#### 6. ✅ CI/CD
- GitHub Actions workflow
- Automatyczne uruchamianie testów na push/PR
- Status check pokazujący ✅ w repozytorium

#### 7. ✅ Deployment
- Aplikacja wdrożona na produkcji (Cloudflare Pages)
- Działa publicznie i jest dostępna pod adresem URL
- Wszystkie funkcjonalności działają na produkcji

**Ważne:** Oczekujemy **POC (Proof of Concept)**, nie pełnego MVP. Najważniejsze jest **świadome wykorzystanie narzędzi AI** w procesie tworzenia.

### Tech Stack

#### Frontend
- **Astro 5.15.1+** - Meta-framework z Islands Architecture
  - SSR mode (Server-Side Rendering)
  - Adapter: `@astrojs/cloudflare` dla Cloudflare Pages
- **React 19.2.0+** - Komponenty interaktywne
  - Używany dla komponentów wymagających interaktywności
- **TypeScript 5+** - Typowany JavaScript
  - Pełne typowanie wszystkich plików
- **Tailwind CSS 3.4.0+** - Utility-first CSS framework
  - Integracja przez `@astrojs/tailwind`

#### Backend
- **Astro SSR** - Server-Side Rendering dla endpointów API
  - Endpointy w `src/pages/api/*`
  - Wymagane: `export const prerender = false;`
- **Cloudflare Pages** - Platforma hostująca
  - Runtime: Cloudflare Workers
  - Automatyczne deployment z GitHub

#### Baza danych i autentykacja
- **Supabase (PostgreSQL)** - Relacyjna baza danych
  - Tabele: `flashcards`, `card_scheduling`, `card_reviews`, `review_sessions`
  - Row-Level Security (RLS) włączone dla wszystkich tabel
- **Supabase Auth** - System autentykacji
  - Email + hasło
  - Session management
  - Access tokens dla API

#### AI
- **OpenRouter** - Gateway do modeli językowych
  - API key: `OPENROUTER_API_KEY` (server-side tylko)
  - Używany do generowania fiszek z tekstu
  - Model: dowolny dostępny przez OpenRouter

#### Narzędzia deweloperskie
- **Vitest 2.1.9+** - Framework testów jednostkowych
- **Playwright** (opcjonalnie) - Framework testów E2E
- **Git** - Kontrola wersji
- **GitHub Actions** - CI/CD

#### Zmienne środowiskowe
```env
PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key
OPENROUTER_API_KEY=sk-or-v1-... (opcjonalne, tylko server-side)
```

### Szacowany czas

**Ramy czasowe:**
- **Start:** Data rozpoczęcia projektu
- **Cel certyfikacji:** Elastyczny termin (zgodnie z harmonogramem 10xDevs)
- **Szacowany czas:** 8-10 tygodni roboczych
- **Czas na tydzień:** ~14 godzin (2h dziennie)

**Podział na etapy:**
- **Etap 1-2:** Setup i baza danych (2 tygodnie)
- **Etap 3:** Autentykacja (1 tydzień)
- **Etap 4-5:** CRUD i Generator AI (2 tygodnie)
- **Etap 6:** System powtórek (1 tydzień)
- **Etap 7:** Dashboard (1 tydzień)
- **Etap 8-9:** Testy i CI/CD (1 tydzień)
- **Etap 10:** Deployment (1 tydzień)
- **Etap 11:** Dokumentacja i finalizacja (1 tydzień)

**Uwaga:** Czas jest szacunkowy i może się różnić w zależności od doświadczenia i tempa pracy. Najważniejsze jest **jakość** i **zrozumienie**, nie szybkość.

---

## ✅ Przed rozpoczęciem

Przed rozpoczęciem implementacji, upewnij się że masz:

- [ ] **Node.js 22+** zainstalowany (sprawdź: `node --version`)
- [ ] **npm** zainstalowany (sprawdź: `npm --version`)
- [ ] **Git** zainstalowany (sprawdź: `git --version`)
- [ ] **Cursor IDE** zainstalowany (lub inny edytor z AI)
- [ ] **Konto Supabase** utworzone ([supabase.com](https://supabase.com))
- [ ] **Konto OpenRouter** utworzone ([openrouter.ai](https://openrouter.ai)) - opcjonalnie na start
- [ ] **Konto Cloudflare** utworzone ([pages.cloudflare.com](https://pages.cloudflare.com)) - opcjonalnie na start
- [ ] **Konto GitHub** utworzone ([github.com](https://github.com))

**Uwaga:** Niektóre konta możesz utworzyć później (np. Cloudflare przed Etapem 10), ale Supabase i GitHub są potrzebne już na początku.

---

## 🎯 Etapy Implementacji

### Etap 1: Setup i Konfiguracja Projektu
**Cel:** Przygotowanie środowiska deweloperskiego i bootstrap projektu

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 4-6 godzin

#### Zadania:

##### Zadanie 1.1: Bootstrap projektu Astro

**Kroki:**

1. **Utworzenie projektu Astro:**
   ```bash
   npm create astro@latest 10xcards-app
   ```
   
   **Odpowiedzi na pytania:**
   - Template: `Empty` lub `Minimal`
   - TypeScript: `Yes`
   - Install dependencies: `Yes`
   - Git: `Yes` (lub zrobimy później)
   - Cloudflare adapter: **NIE** (zainstalujemy później)

2. **Przejście do katalogu projektu:**
   ```bash
   cd 10xcards-app
   ```

3. **Weryfikacja podstawowej instalacji:**
   ```bash
   npm run dev
   ```
   - Aplikacja powinna uruchomić się na `http://localhost:4321`
   - Powinna wyświetlić się strona startowa Astro

**Weryfikacja:**
- [ ] Projekt Astro utworzony
- [ ] `npm run dev` działa bez błędów
- [ ] Strona startowa wyświetla się w przeglądarce

---

##### Zadanie 1.2: Instalacja zależności

**Kroki:**

1. **Instalacja React integration:**
   ```bash
   npx astro add react
   ```
   - Wybierz `Yes` dla wszystkich opcji

2. **Instalacja Tailwind CSS:**
   ```bash
   npx astro add tailwind
   ```
   - Wybierz `Yes` dla wszystkich opcji

3. **Instalacja Supabase client:**
   ```bash
   npm install @supabase/supabase-js
   ```

4. **Instalacja Cloudflare adapter:**
   ```bash
   npm install @astrojs/cloudflare
   ```

5. **Instalacja narzędzi deweloperskich:**
   ```bash
   npm install -D vitest @vitest/ui
   ```

6. **Weryfikacja instalacji:**
   ```bash
   npm list --depth=0
   ```
   - Sprawdź czy wszystkie pakiety są zainstalowane

**Weryfikacja:**
- [ ] Wszystkie pakiety zainstalowane
- [ ] `package.json` zawiera wszystkie zależności
- [ ] Brak błędów w `npm list`

---

##### Zadanie 1.3: Konfiguracja Astro

**Kroki:**

1. **Edycja `astro.config.mjs`:**
   
   Zastąp zawartość pliku następującą konfiguracją:
   
   ```javascript
   // @ts-check
   import { defineConfig } from 'astro/config';
   import cloudflare from '@astrojs/cloudflare';
   import react from '@astrojs/react';
   import tailwind from '@astrojs/tailwind';

   // https://astro.build/config
   export default defineConfig({
     integrations: [
       react(), 
       tailwind({
         applyBaseStyles: true,
       })
     ],
     adapter: cloudflare(),
     output: 'server', // SSR dla endpointów API
     vite: {
       envPrefix: 'PUBLIC_',
       build: {
         rollupOptions: {
           output: {
             // Cache-busting dla JS
             entryFileNames: 'assets/[name].[hash].js',
             chunkFileNames: 'assets/[name].[hash].js',
             // CSS jest obsługiwany przez Astro/Tailwind automatycznie
           },
         },
       },
     },
   });
   ```

2. **Weryfikacja konfiguracji:**
   ```bash
   npm run dev
   ```
   - Sprawdź czy aplikacja uruchamia się bez błędów
   - Sprawdź konsolę przeglądarki (F12) - nie powinno być błędów

**Weryfikacja:**
- [ ] `astro.config.mjs` zawiera poprawną konfigurację
- [ ] SSR mode włączony (`output: 'server'`)
- [ ] Adapter Cloudflare skonfigurowany
- [ ] Integracje React i Tailwind działają
- [ ] Aplikacja uruchamia się bez błędów

---

##### Zadanie 1.4: Konfiguracja zmiennych środowiskowych

**Kroki:**

1. **Utworzenie `.env.example`:**
   
   Utwórz plik `.env.example` w katalogu głównym projektu:
   
   ```env
   # Supabase Configuration
   PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key

   # OpenRouter API (opcjonalne, dla generatora AI)
   OPENROUTER_API_KEY=sk-or-v1-...
   ```

2. **Utworzenie `.env` (lokalne):**
   
   Skopiuj `.env.example` do `.env`:
   ```bash
   cp .env.example .env
   ```
   
   **UWAGA:** Na razie możesz zostawić placeholder wartości. Prawdziwe klucze dodasz w Etapie 2.

3. **Weryfikacja dostępu do zmiennych:**
   
   Utwórz testowy plik `src/pages/test-env.astro`:
   ```astro
   ---
   const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
   ---
   <html>
     <head><title>Test Env</title></head>
     <body>
       <h1>Test zmiennych środowiskowych</h1>
       <p>Supabase URL: {supabaseUrl || 'Nie ustawiono'}</p>
     </body>
   </html>
   ```
   
   Otwórz `http://localhost:4321/test-env` i sprawdź czy wartość się wyświetla.
   
   **UWAGA:** Usuń ten plik testowy po weryfikacji.

**Weryfikacja:**
- [ ] `.env.example` utworzony
- [ ] `.env` utworzony (z placeholder wartościami)
- [ ] Zmienne środowiskowe są dostępne w kodzie
- [ ] `PUBLIC_*` zmienne są dostępne w przeglądarce

---

##### Zadanie 1.5: Git setup

**Kroki:**

1. **Sprawdzenie czy Git jest zainicjalizowany:**
   ```bash
   git status
   ```
   
   Jeśli nie jest zainicjalizowany:
   ```bash
   git init
   ```

2. **Utworzenie/aktualizacja `.gitignore`:**
   
   Upewnij się, że `.gitignore` zawiera:
   ```
   # build output
   dist/
   # generated types
   .astro/

   # dependencies
   node_modules/

   # logs
   npm-debug.log*
   yarn-debug.log*
   yarn-error.log*
   pnpm-debug.log*

   # environment variables
   .env
   .env.local
   .env.production
   .env.*.local

   # macOS-specific files
   .DS_Store

   # IDE
   .idea/
   .vscode/
   ```

3. **Pierwszy commit:**
   ```bash
   git add .
   git commit -m "feat: initial setup with Astro, React, Tailwind, and Supabase"
   ```

4. **Utworzenie repozytorium na GitHub:**
   - Przejdź na GitHub.com
   - Utwórz nowe repozytorium: `10xcards-app`
   - **NIE** inicjalizuj z README, .gitignore, lub licencją
   - Skopiuj URL repozytorium

5. **Podłączenie do GitHub:**
   ```bash
   git remote add origin https://github.com/twoj-username/10xcards-app.git
   git branch -M main
   git push -u origin main
   ```

**Weryfikacja:**
- [ ] Git zainicjalizowany
- [ ] `.gitignore` zawiera `.env`
- [ ] Pierwszy commit wykonany
- [ ] Repozytorium na GitHub utworzone
- [ ] Kod wypushowany do GitHub

---

#### Weryfikacja etapu

Przed przejściem do Etapu 2, upewnij się że:

- [ ] Aplikacja uruchamia się: `npm run dev`
- [ ] Brak błędów w konsoli przeglądarki
- [ ] Brak błędów w terminalu
- [ ] Repozytorium Git działa
- [ ] Wszystkie zależności zainstalowane (`npm list` bez błędów)
- [ ] `astro.config.mjs` jest poprawnie skonfigurowany
- [ ] `.env` i `.env.example` istnieją
- [ ] Kod jest wypushowany do GitHub

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 2!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Bootstrap projektu

Jeśli używasz Cursor IDE, możesz użyć następującego promptu:

```
Pomóż mi skonfigurować projekt Astro dla aplikacji 10xCards.

Wymagania:
1. Astro 5.15.1+ z TypeScript
2. React 19.2.0+ dla komponentów interaktywnych
3. Tailwind CSS 3.4.0+ do stylizacji
4. Supabase client do połączenia z bazą danych
5. Cloudflare adapter dla SSR i deployment
6. Vitest do testów

Stack: Astro + React + TypeScript + Tailwind + Supabase + Cloudflare

Utwórz:
- astro.config.mjs z poprawną konfiguracją SSR i adapterem Cloudflare
- .env.example z placeholder wartościami dla Supabase i OpenRouter
- .gitignore z odpowiednimi wykluczeniami (w tym .env)

Upewnij się, że konfiguracja jest gotowa do użycia z Supabase Auth i endpointami API.
```

##### Prompt dla Cursor IDE - Konfiguracja Astro

```
Skonfiguruj astro.config.mjs dla projektu 10xCards:

Wymagania:
- SSR mode (output: 'server')
- Adapter Cloudflare (@astrojs/cloudflare)
- Integracja React (@astrojs/react)
- Integracja Tailwind (@astrojs/tailwind) z applyBaseStyles: true
- Vite envPrefix: 'PUBLIC_' dla zmiennych środowiskowych
- Cache-busting dla JS (hash w nazwach plików)

Upewnij się, że konfiguracja jest zgodna z najlepszymi praktykami Astro 5+.
```

##### Troubleshooting

**Problem:** `npm run dev` nie uruchamia się
- **Rozwiązanie:** Sprawdź czy wszystkie zależności są zainstalowane: `npm install`

**Problem:** Błąd "Cannot find module '@astrojs/cloudflare'"
- **Rozwiązanie:** Zainstaluj adapter: `npm install @astrojs/cloudflare`

**Problem:** Zmienne środowiskowe nie są dostępne
- **Rozwiązanie:** 
  - Upewnij się, że zmienne zaczynają się od `PUBLIC_`
  - Zrestartuj serwer dev (`Ctrl+C` i `npm run dev`)
  - Sprawdź czy `.env` istnieje w katalogu głównym

**Problem:** Git push nie działa
- **Rozwiązanie:** 
  - Sprawdź czy masz skonfigurowany Git: `git config --list`
  - Sprawdź czy remote jest poprawnie ustawiony: `git remote -v`
  - Upewnij się, że masz uprawnienia do repozytorium na GitHub

---

### Etap 2: Baza danych i Supabase
**Cel:** Utworzenie schematu bazy danych i integracja z Supabase

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 6-8 godzin

**Przed rozpoczęciem:**
- Upewnij się, że masz konto Supabase i utworzyłeś projekt
- Sprawdź czy plik `.env.example` został utworzony w Etapie 1
- Jeśli nie, utwórz go teraz (zobacz Etap 1, Zadanie 1.3)

#### Zadania:

##### Zadanie 2.1: Utworzenie projektu Supabase

**Kroki:**

1. **Utworzenie konta Supabase:**
   - Przejdź na [supabase.com](https://supabase.com)
   - Kliknij "Start your project"
   - Zaloguj się lub utwórz konto (możesz użyć GitHub)

2. **Utworzenie nowego projektu:**
   - Kliknij "New Project"
   - Wypełnij formularz:
     - **Name:** `10xcards` (lub dowolna nazwa)
     - **Database Password:** Wygeneruj silne hasło (zapisz je!)
     - **Region:** Wybierz najbliższą (np. `West Europe`)
     - **Pricing Plan:** Free (darmowy plan wystarczy dla POC)
   - Kliknij "Create new project"
   - Poczekaj 2-3 minuty na utworzenie projektu

3. **Pobranie kluczy API:**
   - W dashboardzie projektu, przejdź do: **Settings** → **API**
   - Skopiuj następujące wartości:
     - **Project URL** → to będzie `PUBLIC_SUPABASE_URL`
     - **anon public** key → to będzie `PUBLIC_SUPABASE_ANON_KEY`
   - **WAŻNE:** Nie udostępniaj tych kluczy publicznie, ale `anon` key jest bezpieczny do użycia w kliencie (chroniony przez RLS)

4. **Aktualizacja `.env`:**
   
   Otwórz plik `.env` i zaktualizuj wartości:
   ```env
   PUBLIC_SUPABASE_URL=https://twoj-projekt-id.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key-tutaj
   ```

**Weryfikacja:**
- [ ] Projekt Supabase utworzony
- [ ] Klucze API skopiowane
- [ ] `.env` zaktualizowany z prawdziwymi wartościami
- [ ] Dashboard Supabase jest dostępny

---

##### Zadanie 2.2: Migracje SQL - Tabela `flashcards`

**Kroki:**

1. **Otwarcie SQL Editor:**
   - W dashboardzie Supabase, kliknij **SQL Editor** w menu bocznym
   - Kliknij **New query**

2. **Utworzenie tabeli `flashcards`:**
   
   Wklej następujący SQL i kliknij **Run**:
   
   ```sql
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
   ```

3. **Weryfikacja:**
   - Sprawdź czy nie ma błędów w wynikach
   - Przejdź do **Table Editor** → **flashcards**
   - Tabela powinna być widoczna (na razie pusta)

**Weryfikacja:**
- [ ] Tabela `flashcards` utworzona
- [ ] RLS włączone
- [ ] Polityki RLS utworzone (4 polityki: SELECT, INSERT, UPDATE, DELETE)
- [ ] Indeksy utworzone
- [ ] Trigger dla `updated_at` działa

---

##### Zadanie 2.3: Migracje SQL - Tabela `card_scheduling`

**Kroki:**

1. **Utworzenie tabeli `card_scheduling`:**
   
   W SQL Editor, wklej i uruchom:
   
   ```sql
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
   ```

2. **Weryfikacja:**
   - Sprawdź czy nie ma błędów
   - Tabela powinna być widoczna w Table Editor

**Weryfikacja:**
- [ ] Tabela `card_scheduling` utworzona
- [ ] Foreign keys działają
- [ ] RLS włączone
- [ ] Polityki RLS utworzone
- [ ] Indeksy utworzone

---

##### Zadanie 2.4: Migracje SQL - Tabela `card_reviews`

**Kroki:**

1. **Utworzenie tabeli `card_reviews`:**
   
   W SQL Editor, wklej i uruchom:
   
   ```sql
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
   ```

2. **Weryfikacja:**
   - Sprawdź czy nie ma błędów
   - Tabela powinna być widoczna w Table Editor

**Weryfikacja:**
- [ ] Tabela `card_reviews` utworzona
- [ ] Constraint CHECK dla `grade` działa
- [ ] RLS włączone
- [ ] Polityki RLS utworzone (tylko SELECT i INSERT)
- [ ] Indeksy utworzone

---

##### Zadanie 2.5: Migracje SQL - Tabela `review_sessions`

**Kroki:**

1. **Utworzenie tabeli `review_sessions`:**
   
   W SQL Editor, wklej i uruchom:
   
   ```sql
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
   ```

2. **Weryfikacja computed column:**
   
   Przetestuj czy `accuracy` jest obliczane automatycznie:
   ```sql
   -- Test insert (jako zalogowany użytkownik - w praktyce użyj Supabase Auth)
   -- Ten test możesz wykonać później, po implementacji auth
   ```

**Weryfikacja:**
- [ ] Tabela `review_sessions` utworzona
- [ ] Computed column `accuracy` działa
- [ ] RLS włączone
- [ ] Polityki RLS utworzone
- [ ] Indeksy utworzone

---

##### Zadanie 2.6: Klient Supabase w kodzie

**Kroki:**

1. **Utworzenie katalogu dla migracji (opcjonalnie):**
   ```bash
   mkdir -p supabase/migrations
   ```
   
   **UWAGA:** Migracje SQL możesz zapisać w plikach w tym katalogu dla dokumentacji, ale w Supabase wykonujesz je przez SQL Editor.

2. **Utworzenie klienta Supabase:**
   
   Utwórz plik `src/lib/supabase.ts`:
   
   ```typescript
   import { createClient, type SupabaseClient } from '@supabase/supabase-js';

   // 🔒 SECURITY: Klucze Supabase (PUBLIC_*) są bezpieczne do użycia w kliencie,
   // ale najlepiej przechowywać je w zmiennych środowiskowych.
   // Wymagane zmienne środowiskowe w .env:
   // - PUBLIC_SUPABASE_URL (pobierz z Supabase Dashboard -> Settings -> API)
   // - PUBLIC_SUPABASE_ANON_KEY (pobierz z Supabase Dashboard -> Settings -> API)

   let supabaseInstance: SupabaseClient | null = null;

   function getSupabaseClient(): SupabaseClient {
     if (supabaseInstance) {
       return supabaseInstance;
     }

     const supabaseUrl = String(import.meta.env.PUBLIC_SUPABASE_URL || '').trim();
     const supabaseAnonKey = String(import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();

     if (!supabaseUrl || !supabaseAnonKey) {
       throw new Error(
         'Supabase credentials are required.\n' +
         'Dodaj do pliku .env:\n' +
         '  PUBLIC_SUPABASE_URL=twoj-url\n' +
         '  PUBLIC_SUPABASE_ANON_KEY=twoj-klucz\n' +
         'Pobierz wartości z: Supabase Dashboard -> Settings -> API'
       );
     }

     supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
     return supabaseInstance;
   }

   export const supabase = getSupabaseClient();
   ```

3. **Test połączenia:**
   
   Utwórz testowy endpoint `src/pages/api/test-supabase.ts`:
   
   ```typescript
   import type { APIRoute } from 'astro';
   import { supabase } from '../../lib/supabase';

   export const prerender = false;

   export const GET: APIRoute = async () => {
     try {
       // Test połączenia - pobierz liczbę tabel
       const { data, error } = await supabase
         .from('flashcards')
         .select('id')
         .limit(1);

       if (error) {
         return new Response(
           JSON.stringify({ 
             success: false, 
             error: error.message,
             hint: 'Sprawdź czy tabele są utworzone w Supabase'
           }), 
           { 
             status: 500,
             headers: { 'Content-Type': 'application/json' }
           }
         );
       }

       return new Response(
         JSON.stringify({ 
           success: true, 
           message: 'Połączenie z Supabase działa!',
           tables: 'flashcards dostępna'
         }), 
         { 
           status: 200,
           headers: { 'Content-Type': 'application/json' }
         }
       );
     } catch (err) {
       return new Response(
         JSON.stringify({ 
           success: false, 
           error: err instanceof Error ? err.message : 'Unknown error'
         }), 
         { 
           status: 500,
           headers: { 'Content-Type': 'application/json' }
         }
       );
     }
   };
   ```

4. **Test w przeglądarce:**
   - Uruchom `npm run dev`
   - Otwórz `http://localhost:4321/api/test-supabase`
   - Powinieneś zobaczyć: `{"success": true, "message": "Połączenie z Supabase działa!", ...}`

5. **Usunięcie testowego endpointu:**
   
   Po weryfikacji, usuń plik `src/pages/api/test-supabase.ts`

**Weryfikacja:**
- [ ] Plik `src/lib/supabase.ts` utworzony
- [ ] Klient Supabase działa
- [ ] Test połączenia zwraca sukces
- [ ] Brak błędów w konsoli

---

#### Weryfikacja etapu

Przed przejściem do Etapu 3, upewnij się że:

- [ ] Projekt Supabase utworzony i dostępny
- [ ] Wszystkie 4 tabele utworzone:
  - [ ] `flashcards`
  - [ ] `card_scheduling`
  - [ ] `card_reviews`
  - [ ] `review_sessions`
- [ ] RLS włączone dla wszystkich tabel
- [ ] Polityki RLS działają (możesz przetestować w Table Editor)
- [ ] Indeksy utworzone
- [ ] Klient Supabase działa (`src/lib/supabase.ts`)
- [ ] Test połączenia przechodzi
- [ ] `.env` zawiera prawdziwe klucze Supabase

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 3!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Schema bazy danych

```
Na podstawie wymagań projektu 10xCards, stwórz kompletną migrację SQL dla Supabase:

Wymagania:
1. Tabela flashcards (id, user_id, front, back, tags[], timestamps)
2. Tabela card_scheduling (card_id, user_id, ease, interval_days, repetitions, due_at)
3. Tabela card_reviews (id, user_id, card_id, reviewed_at, grade, prev/new values)
4. Tabela review_sessions (id, user_id, completed_at, cards_reviewed, cards_correct, accuracy computed)

Wymagania bezpieczeństwa:
- Wszystkie tabele muszą mieć włączone Row-Level Security (RLS)
- Polityki RLS: użytkownik może tylko czytać/modyfikować swoje własne dane
- Użyj auth.uid() do weryfikacji użytkownika
- Foreign keys z ON DELETE CASCADE

Wydajność:
- Indeksy na user_id, due_at, card_id
- GIN index na tags (array)

Dodatkowe:
- Trigger dla automatycznej aktualizacji updated_at w flashcards
- Computed column accuracy w review_sessions

Format: Gotowy SQL do wykonania w Supabase SQL Editor.
```

##### Prompt dla Cursor IDE - Klient Supabase

```
Stwórz klienta Supabase dla projektu 10xCards:

Wymagania:
- Plik: src/lib/supabase.ts
- Singleton pattern (jeden instancja klienta)
- Zmienne środowiskowe: PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
- Obsługa błędów: rzucanie wyjątków z pomocnymi komunikatami
- TypeScript z pełnym typowaniem

Stack: Astro + TypeScript + Supabase

Upewnij się, że klient jest gotowy do użycia z Supabase Auth i operacjami CRUD.
```

##### Troubleshooting

**Problem:** Błąd "relation does not exist"
- **Rozwiązanie:** 
  - Sprawdź czy wykonałeś wszystkie migracje SQL w Supabase SQL Editor
  - Sprawdź czy nazwy tabel są poprawne (wielkość liter ma znaczenie w PostgreSQL)
  - Upewnij się, że używasz schematu `public.` przed nazwą tabeli

**Problem:** Błąd "new row violates row-level security policy"
- **Rozwiązanie:**
  - Sprawdź czy RLS policies są utworzone
  - Sprawdź czy używasz `auth.uid()` w politykach
  - Upewnij się, że użytkownik jest zalogowany (będzie w Etapie 3)

**Problem:** Klient Supabase nie łączy się
- **Rozwiązanie:**
  - Sprawdź czy `.env` zawiera prawdziwe wartości
  - Sprawdź czy zmienne zaczynają się od `PUBLIC_`
  - Zrestartuj serwer dev (`Ctrl+C` i `npm run dev`)
  - Sprawdź czy URL i klucz są poprawne w Supabase Dashboard

**Problem:** Computed column `accuracy` nie działa
- **Rozwiązanie:**
  - Sprawdź czy używasz `GENERATED ALWAYS AS ... STORED`
  - Sprawdź czy `cards_reviewed > 0` w CASE statement
  - Upewnij się, że typ to `numeric(5,2)`

**Problem:** Trigger `updated_at` nie działa
- **Rozwiązanie:**
  - Sprawdź czy funkcja `update_updated_at_column()` istnieje
  - Sprawdź czy trigger jest utworzony i aktywny
  - W Table Editor, edytuj rekord i sprawdź czy `updated_at` się zmienia

---

### Etap 3: Autentykacja
**Cel:** Implementacja systemu logowania, rejestracji i zarządzania sesją

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 6-8 godzin

#### Zadania:

##### Zadanie 3.1: Strona logowania

**Kroki:**

1. **Utworzenie strony logowania:**
   
   Utwórz plik `src/pages/login.astro`:
   
   ```astro
   ---
   import '../styles/global.css';
   ---

   <html lang="pl">
     <head>
       <meta charset="utf-8" />
       <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Logowanie - 10xCards</title>
     </head>
     <body>
       <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-600 to-blue-600">
         <div class="max-w-md w-full">
           <!-- Logo i nagłówek -->
           <div class="text-center mb-8">
             <h1 class="text-4xl font-bold text-white mb-2">10xCards</h1>
             <p class="text-white/80">Zaloguj się do swojego konta</p>
           </div>

           <!-- Formularz -->
           <div class="bg-white rounded-2xl shadow-xl p-8">
             <form id="loginForm" class="space-y-6">
               <!-- Email -->
               <div>
                 <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                   Email
                 </label>
                 <input
                   type="email"
                   id="email"
                   name="email"
                   required
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="twoj@email.pl"
                 />
               </div>

               <!-- Hasło -->
               <div>
                 <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                   Hasło
                 </label>
                 <input
                   type="password"
                   id="password"
                   name="password"
                   required
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="••••••••"
                 />
               </div>

               <!-- Error message -->
               <div id="errorMessage" class="hidden text-sm text-red-600 bg-red-50 p-3 rounded-lg"></div>

               <!-- Submit button -->
               <button
                 type="submit"
                 id="submitButton"
                 class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
               >
                 Zaloguj się
               </button>
             </form>

             <!-- Link do rejestracji -->
             <div class="mt-6 text-center">
               <p class="text-sm text-gray-600">
                 Nie masz konta?{' '}
                 <a href="/register" class="text-purple-600 font-medium hover:text-purple-700">
                   Zarejestruj się
                 </a>
               </p>
             </div>
           </div>
         </div>
       </div>

       <script>
         import { supabase } from '../lib/supabase';

         // Pobierz parametr redirect z URL
         const urlParams = new URLSearchParams(window.location.search);
         const rawRedirect = urlParams.get('redirect');
         
         // Walidacja redirect - tylko wewnętrzne ścieżki
         let redirectTo = '/dashboard';
         if (rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.includes('//')) {
           redirectTo = rawRedirect;
         }

         document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
           e.preventDefault();
           
           const form = e.target as HTMLFormElement;
           const email = (form.querySelector('#email') as HTMLInputElement)?.value;
           const password = (form.querySelector('#password') as HTMLInputElement)?.value;
           const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
           const submitButton = document.getElementById('submitButton') as HTMLButtonElement;

           // Reset error
           if (errorMessage) {
             errorMessage.classList.add('hidden');
             errorMessage.textContent = '';
           }

           // Disable button
           if (submitButton) {
             submitButton.disabled = true;
             submitButton.textContent = 'Logowanie...';
           }

           try {
             const { data, error } = await supabase.auth.signInWithPassword({
               email,
               password,
             });

             if (error) throw error;

             // Redirect to original page or dashboard
             window.location.href = redirectTo;
           } catch (error: any) {
             // Show error
             if (errorMessage) {
               errorMessage.textContent = error.message || 'Niepoprawne dane logowania';
               errorMessage.classList.remove('hidden');
             }

             // Re-enable button
             if (submitButton) {
               submitButton.disabled = false;
               submitButton.textContent = 'Zaloguj się';
             }
           }
         });
       </script>
     </body>
   </html>
   ```

2. **Weryfikacja:**
   - Otwórz `http://localhost:4321/login`
   - Formularz powinien się wyświetlić
   - Spróbuj zalogować się (na razie może nie działać, jeśli nie masz użytkownika)

**Weryfikacja:**
- [ ] Strona `/login` jest dostępna
- [ ] Formularz wyświetla się poprawnie
- [ ] Walidacja email działa
- [ ] Obsługa błędów działa

---

##### Zadanie 3.2: Strona rejestracji

**Kroki:**

1. **Utworzenie strony rejestracji:**
   
   Utwórz plik `src/pages/register.astro`:
   
   ```astro
   ---
   import '../styles/global.css';
   ---

   <html lang="pl">
     <head>
       <meta charset="utf-8" />
       <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Rejestracja - 10xCards</title>
     </head>
     <body>
       <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-purple-600 to-blue-600">
         <div class="max-w-md w-full">
           <!-- Logo i nagłówek -->
           <div class="text-center mb-8">
             <h1 class="text-4xl font-bold text-white mb-2">10xCards</h1>
             <p class="text-white/80">Stwórz nowe konto</p>
           </div>

           <!-- Formularz -->
           <div class="bg-white rounded-2xl shadow-xl p-8">
             <form id="registerForm" class="space-y-6">
               <!-- Email -->
               <div>
                 <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                   Email
                 </label>
                 <input
                   type="email"
                   id="email"
                   name="email"
                   required
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="twoj@email.pl"
                 />
               </div>

               <!-- Hasło -->
               <div>
                 <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                   Hasło
                 </label>
                 <input
                   type="password"
                   id="password"
                   name="password"
                   required
                   minlength="6"
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="••••••••"
                 />
                 <p class="mt-1 text-xs text-gray-500">Minimum 6 znaków</p>
               </div>

               <!-- Potwierdzenie hasła -->
               <div>
                 <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                   Potwierdź hasło
                 </label>
                 <input
                   type="password"
                   id="confirmPassword"
                   name="confirmPassword"
                   required
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                   placeholder="••••••••"
                 />
               </div>

               <!-- Error message -->
               <div id="errorMessage" class="hidden text-sm text-red-600 bg-red-50 p-3 rounded-lg"></div>

               <!-- Submit button -->
               <button
                 type="submit"
                 id="submitButton"
                 class="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
               >
                 Zarejestruj się
               </button>
             </form>

             <!-- Link do logowania -->
             <div class="mt-6 text-center">
               <p class="text-sm text-gray-600">
                 Masz już konto?{' '}
                 <a href="/login" class="text-purple-600 font-medium hover:text-purple-700">
                   Zaloguj się
                 </a>
               </p>
             </div>
           </div>
         </div>
       </div>

       <script>
         import { supabase } from '../lib/supabase';

         document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
           e.preventDefault();
           
           const form = e.target as HTMLFormElement;
           const email = (form.querySelector('#email') as HTMLInputElement)?.value;
           const password = (form.querySelector('#password') as HTMLInputElement)?.value;
           const confirmPassword = (form.querySelector('#confirmPassword') as HTMLInputElement)?.value;
           const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
           const submitButton = document.getElementById('submitButton') as HTMLButtonElement;

           // Reset error
           if (errorMessage) {
             errorMessage.classList.add('hidden');
             errorMessage.textContent = '';
           }

           // Validate passwords match
           if (password !== confirmPassword) {
             if (errorMessage) {
               errorMessage.textContent = 'Hasła nie zgadzają się!';
               errorMessage.classList.remove('hidden');
             }
             return;
           }

           // Validate password length
           if (password.length < 6) {
             if (errorMessage) {
               errorMessage.textContent = 'Hasło musi mieć minimum 6 znaków!';
               errorMessage.classList.remove('hidden');
             }
             return;
           }

           // Disable button
           if (submitButton) {
             submitButton.disabled = true;
             submitButton.textContent = 'Rejestrowanie...';
           }

           try {
             const { data, error } = await supabase.auth.signUp({
               email,
               password,
             });

             if (error) throw error;

             // Redirect to dashboard
             window.location.href = '/dashboard';
           } catch (error: any) {
             // Show error
             if (errorMessage) {
               errorMessage.textContent = error.message || 'Błąd rejestracji';
               errorMessage.classList.remove('hidden');
             }

             // Re-enable button
             if (submitButton) {
               submitButton.disabled = false;
               submitButton.textContent = 'Zarejestruj się';
             }
           }
         });
       </script>
     </body>
   </html>
   ```

2. **Weryfikacja:**
   - Otwórz `http://localhost:4321/register`
   - Spróbuj zarejestrować nowe konto
   - Sprawdź czy przekierowuje do `/dashboard` po rejestracji

**Weryfikacja:**
- [ ] Strona `/register` jest dostępna
- [ ] Formularz wyświetla się poprawnie
- [ ] Walidacja haseł działa (długość, potwierdzenie)
- [ ] Rejestracja działa i tworzy użytkownika w Supabase
- [ ] Przekierowanie do dashboard działa

---

##### Zadanie 3.3: Middleware autentykacji

**Kroki:**

1. **Utworzenie middleware:**
   
   Utwórz plik `src/middleware.ts`:
   
   ```typescript
   import type { MiddlewareHandler } from 'astro';

   export const onRequest: MiddlewareHandler = async (context, next) => {
     const response = await next();
     
     // Dla stron HTML - wyłącz cache, aby zawsze dostarczać najnowszą wersję
     const url = context.url;
     const protectedPaths = ['/dashboard', '/flashcards', '/generate', '/review'];
     
     if (url.pathname === '/' || protectedPaths.some(path => url.pathname.startsWith(path))) {
       response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
       response.headers.set('Pragma', 'no-cache');
       response.headers.set('Expires', '0');
     }
     
     return response;
   };
   ```

   **UWAGA:** Middleware w Astro działa na każdym requestcie. W tym przypadku używamy go głównie do cache headers. Ochrona tras będzie w komponencie AuthWrapper.

2. **Weryfikacja:**
   - Middleware powinien działać automatycznie
   - Sprawdź w DevTools (Network tab) czy nagłówki cache są ustawione

**Weryfikacja:**
- [ ] Plik `src/middleware.ts` utworzony
- [ ] Middleware działa (sprawdź w DevTools)
- [ ] Cache headers są ustawione dla chronionych ścieżek

---

##### Zadanie 3.4: Komponent AuthWrapper

**Kroki:**

1. **Utworzenie komponentu AuthWrapper:**
   
   Utwórz plik `src/components/AuthWrapper.tsx`:
   
   ```typescript
   import { useState, useEffect } from 'react';
   import { supabase } from '../lib/supabase';
   import type { User } from '@supabase/supabase-js';

   interface AuthWrapperProps {
     children: React.ReactNode;
   }

   export default function AuthWrapper({ children }: AuthWrapperProps) {
     const [loading, setLoading] = useState(true);
     const [user, setUser] = useState<User | null>(null);

     useEffect(() => {
       checkAuth();

       // Nasłuchuj zmian w sesji
       const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
         if (session) {
           setUser(session.user);
         } else {
           setUser(null);
         }
         setLoading(false);
       });

       return () => {
         subscription.unsubscribe();
       };
     }, []);

     const checkAuth = async () => {
       try {
         const {
           data: { session },
         } = await supabase.auth.getSession();

         if (!session) {
           const redirectTo = encodeURIComponent(window.location.pathname + window.location.search);
           window.location.href = `/login?redirect=${redirectTo}`;
           return;
         }

         setUser(session.user);
       } catch (error) {
         console.error('Auth error:', error);
         const redirectTo = encodeURIComponent(window.location.pathname);
         window.location.href = `/login?redirect=${redirectTo}`;
       } finally {
         setLoading(false);
       }
     };

     if (loading) {
       return (
         <div className="flex items-center justify-center min-h-screen">
           <div className="text-gray-600 text-lg">Ładowanie...</div>
         </div>
       );
     }

     if (!user) {
       return null; // Redirect już nastąpił
     }

     return <>{children}</>;
   }
   ```

2. **Użycie AuthWrapper w chronionych stronach:**
   
   Przykład użycia w `src/pages/dashboard.astro`:
   
   ```astro
   ---
   import AuthWrapper from '../components/AuthWrapper';
   import '../styles/global.css';
   ---

   <html lang="pl">
     <head>
       <meta charset="utf-8" />
       <title>Dashboard - 10xCards</title>
     </head>
     <body>
       <AuthWrapper client:load>
         <h1>Dashboard</h1>
         <p>Jesteś zalogowany!</p>
       </AuthWrapper>
     </body>
   </html>
   ```

3. **Weryfikacja:**
   - Otwórz `/dashboard` bez logowania - powinno przekierować do `/login`
   - Zaloguj się - powinno przekierować z powrotem do `/dashboard`

**Weryfikacja:**
- [ ] Komponent `AuthWrapper.tsx` utworzony
- [ ] Ochrona tras działa (przekierowanie do login)
- [ ] Loading state działa
- [ ] Nasłuchiwanie zmian sesji działa

---

##### Zadanie 3.5: Wylogowanie

**Kroki:**

1. **Utworzenie layoutu z przyciskiem wylogowania:**
   
   Utwórz plik `src/components/LogoutButton.tsx`:
   
   ```typescript
   import { supabase } from '../lib/supabase';

   export default function LogoutButton() {
     const handleLogout = async () => {
       try {
         const { error } = await supabase.auth.signOut();
         if (error) throw error;
         
         // Redirect to login
         window.location.href = '/login';
       } catch (error) {
         console.error('Logout error:', error);
         alert('Błąd podczas wylogowania');
       }
     };

     return (
       <button
         onClick={handleLogout}
         className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
       >
         Wyloguj się
       </button>
     );
   }
   ```

2. **Dodanie przycisku do layoutu:**
   
   Możesz dodać przycisk wylogowania do każdej chronionej strony lub utworzyć wspólny layout. Przykład w `src/pages/dashboard.astro`:
   
   ```astro
   ---
   import AuthWrapper from '../components/AuthWrapper';
   import LogoutButton from '../components/LogoutButton';
   import '../styles/global.css';
   ---

   <html lang="pl">
     <head>
       <meta charset="utf-8" />
       <title>Dashboard - 10xCards</title>
     </head>
     <body>
       <AuthWrapper client:load>
         <div class="min-h-screen bg-gray-50">
           <nav class="bg-white shadow">
             <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div class="flex justify-between h-16">
                 <div class="flex items-center">
                   <h1 class="text-xl font-bold">10xCards</h1>
                 </div>
                 <div class="flex items-center">
                   <LogoutButton client:load />
                 </div>
               </div>
             </div>
           </nav>
           
           <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
             <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
             <p>Jesteś zalogowany!</p>
           </main>
         </div>
       </AuthWrapper>
     </body>
   </html>
   ```

3. **Weryfikacja:**
   - Kliknij przycisk "Wyloguj się"
   - Powinno przekierować do `/login`
   - Spróbuj otworzyć `/dashboard` ponownie - powinno przekierować do login

**Weryfikacja:**
- [ ] Przycisk wylogowania działa
- [ ] Wylogowanie usuwa sesję
- [ ] Przekierowanie do login działa
- [ ] Po wylogowaniu nie można dostać się do chronionych stron

---

##### Zadanie 3.6: UI/UX auth

**Kroki:**

1. **Ulepszenie stylizacji formularzy:**
   - Upewnij się, że wszystkie formularze używają spójnych stylów Tailwind
   - Dodaj hover states i transitions
   - Upewnij się, że formularze są responsywne

2. **Ulepszenie loading states:**
   - Dodaj spinner lub skeleton loader podczas ładowania
   - Upewnij się, że przyciski pokazują stan "loading"

3. **Ulepszenie komunikatów błędów:**
   - Upewnij się, że błędy są czytelne i pomocne
   - Dodaj różne komunikaty dla różnych typów błędów

4. **Test end-to-end:**
   - Rejestracja → Logowanie → Dashboard → Wylogowanie
   - Wszystkie kroki powinny działać płynnie

**Weryfikacja:**
- [ ] Formularze są stylizowane i responsywne
- [ ] Loading states są widoczne
- [ ] Komunikaty błędów są czytelne
- [ ] Pełny przepływ działa end-to-end

---

#### Weryfikacja etapu

Przed przejściem do Etapu 4, upewnij się że:

- [ ] Można się zarejestrować (`/register`)
- [ ] Można się zalogować (`/login`)
- [ ] Można się wylogować (przycisk logout)
- [ ] Chronione trasy wymagają logowania (przekierowanie do `/login`)
- [ ] Sesja jest zarządzana poprawnie (odświeżanie strony nie wylogowuje)
- [ ] Przekierowania działają (po login wraca do oryginalnej strony)
- [ ] UI jest czytelne i responsywne

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 4!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Strona logowania

```
Stwórz stronę logowania dla aplikacji 10xCards:

Wymagania:
- Plik: src/pages/login.astro
- Formularz z email i hasłem
- Integracja z Supabase Auth (supabase.auth.signInWithPassword)
- Obsługa błędów z wyświetlaniem komunikatów
- Loading state podczas logowania
- Przekierowanie do /dashboard po zalogowaniu
- Obsługa parametru ?redirect= w URL
- Stylizacja z Tailwind CSS (gradient background, white card)
- Link do strony rejestracji

Stack: Astro + TypeScript + Supabase Auth + Tailwind CSS

Upewnij się, że formularz jest responsywny i ma dobre UX.
```

##### Prompt dla Cursor IDE - Komponent AuthWrapper

```
Stwórz komponent AuthWrapper dla ochrony tras w aplikacji 10xCards:

Wymagania:
- Plik: src/components/AuthWrapper.tsx
- React component z TypeScript
- Sprawdzanie sesji użytkownika (supabase.auth.getSession)
- Przekierowanie do /login jeśli użytkownik nie jest zalogowany
- Loading state podczas sprawdzania sesji
- Nasłuchiwanie zmian w sesji (onAuthStateChange)
- Props: children (React.ReactNode)

Stack: Astro + React + TypeScript + Supabase Auth

Upewnij się, że komponent jest gotowy do użycia w stronach Astro z client:load.
```

##### Troubleshooting

**Problem:** Błąd "Invalid login credentials"
- **Rozwiązanie:**
  - Sprawdź czy użytkownik istnieje w Supabase (Table Editor → auth.users)
  - Sprawdź czy email i hasło są poprawne
  - Upewnij się, że używasz `signInWithPassword` a nie `signIn`

**Problem:** Przekierowanie nie działa po login
- **Rozwiązanie:**
  - Sprawdź czy `window.location.href` jest używane (nie `router.push`)
  - Sprawdź czy parametr `redirect` jest poprawnie parsowany
  - Sprawdź czy walidacja redirect zapobiega open redirect

**Problem:** Sesja znika po odświeżeniu strony
- **Rozwiązanie:**
  - Sprawdź czy Supabase Auth jest poprawnie skonfigurowany
  - Sprawdź czy cookies są zapisywane (DevTools → Application → Cookies)
  - Upewnij się, że używasz `getSession()` a nie `getUser()`

**Problem:** AuthWrapper powoduje nieskończoną pętlę przekierowań
- **Rozwiązanie:**
  - Sprawdź czy `checkAuth` nie jest wywoływane w pętli
  - Upewnij się, że `setLoading(false)` jest wywoływane w `finally`
  - Sprawdź czy nie ma konfliktu między middleware a AuthWrapper

**Problem:** Przycisk logout nie działa
- **Rozwiązanie:**
  - Sprawdź czy używasz `signOut()` a nie `signOut({ scope: 'global' })`
  - Sprawdź czy error handling działa
  - Upewnij się, że przycisk ma `client:load` w Astro

---

### Etap 4: CRUD Fiszek
**Cel:** Implementacja pełnych operacji CRUD dla fiszek

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 8-10 godzin

#### Zadania:

##### Zadanie 4.1: Strona fiszek

**Kroki:**

1. **Utworzenie strony fiszek:**
   
   Utwórz plik `src/pages/flashcards.astro`:
   
   ```astro
   ---
   import '../styles/global.css';
   import AuthWrapper from '../components/AuthWrapper';
   ---

   <html lang="pl">
     <head>
       <meta charset="utf-8" />
       <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Moje fiszki - 10xCards</title>
     </head>
     <body>
       <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-blue-600">
         <div class="max-w-6xl mx-auto">
           <!-- Header -->
           <header class="mb-8 flex items-center justify-between">
             <div>
               <h1 class="text-4xl font-bold text-white mb-2">Moje fiszki</h1>
               <p class="text-white/80">Zarządzaj swoimi fiszkami</p>
             </div>
             <a
               href="/dashboard"
               class="text-white hover:text-gray-200 px-4 py-2 rounded-lg hover:bg-white/10 transition"
             >
               ← Dashboard
             </a>
           </header>

           <!-- Flashcard CRUD Component -->
           <AuthWrapper client:load>
             <!-- FlashcardManager będzie renderowany tutaj -->
           </AuthWrapper>
         </div>
       </div>
     </body>
   </html>
   ```

2. **Weryfikacja:**
   - Otwórz `http://localhost:4321/flashcards`
   - Strona powinna się wyświetlić (na razie bez komponentu)

**Weryfikacja:**
- [ ] Strona `/flashcards` jest dostępna
- [ ] Strona wymaga logowania (przekierowanie do `/login`)
- [ ] Header wyświetla się poprawnie

---

##### Zadanie 4.2: Komponent FlashcardManager - Podstawowa struktura

**Kroki:**

1. **Utworzenie komponentu FlashcardManager:**
   
   Utwórz plik `src/components/FlashcardManager.tsx` z podstawową strukturą:
   
   ```typescript
   import { useState, useEffect } from 'react';
   import { supabase } from '../lib/supabase';

   interface Flashcard {
     id: string;
     front: string;
     back: string;
     tags: string[];
     created_at: string;
     updated_at: string;
   }

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
       front: '',
       back: '',
       tags: '',
     });

     // Funkcje CRUD są implementowane w Etapie 4

     return (
       <div className="space-y-6">
         <h2 className="text-2xl font-semibold text-white">
           Wszystkie fiszki ({flashcards.length})
         </h2>
         <p className="text-white">Komponent FlashcardManager - w trakcie implementacji</p>
       </div>
     );
   }
   ```

2. **Aktualizacja AuthWrapper:**
   
   Zaktualizuj `src/components/AuthWrapper.tsx`, aby renderował FlashcardManager:
   
   ```typescript
   // ... existing code ...
   
   if (!user) {
     return null;
   }

   return (
     <FlashcardManager userId={user.id} />
   );
   ```

   I dodaj import:
   ```typescript
   import FlashcardManager from './FlashcardManager';
   ```

3. **Weryfikacja:**
   - Otwórz `/flashcards`
   - Komponent powinien się wyświetlić

**Weryfikacja:**
- [ ] Komponent `FlashcardManager.tsx` utworzony
- [ ] Komponent renderuje się w `/flashcards`
- [ ] State management działa (useState)

---

##### Zadanie 4.3: Lista fiszek

**Kroki:**

1. **Dodanie funkcji pobierania fiszek:**
   
   W `FlashcardManager.tsx`, dodaj funkcję `refreshFlashcards`:
   
   ```typescript
   const refreshFlashcards = async () => {
     setLoading(true);
     setError(null);
     try {
       const { data, error } = await supabase
         .from('flashcards')
         .select('*')
         .eq('user_id', userId)
         .order('created_at', { ascending: false });

       if (error) throw error;
       setFlashcards(data || []);
     } catch (err: any) {
       setError(err.message || 'Błąd podczas pobierania fiszek');
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Dodanie useEffect do pobierania przy mount:**
   
   ```typescript
   useEffect(() => {
     refreshFlashcards();
   }, [userId]);
   ```

3. **Dodanie wyświetlania listy:**
   
   Zastąp return w komponencie:
   
   ```typescript
   return (
     <div className="space-y-6">
       {/* Error message */}
       {error && (
         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
           {error}
         </div>
       )}

       {/* Loading state */}
       {loading && (
         <div className="text-center text-white py-8">Ładowanie...</div>
       )}

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
             <div
               key={card.id}
               className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
             >
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
                     <span
                       key={idx}
                       className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                     >
                       {tag}
                     </span>
                   ))}
                 </div>
               )}
             </div>
           ))}
         </div>
       )}
     </div>
   );
   ```

4. **Weryfikacja:**
   - Otwórz `/flashcards`
   - Jeśli masz fiszki w bazie, powinny się wyświetlić
   - Jeśli nie masz, powinien wyświetlić się komunikat "Brak fiszek"

**Weryfikacja:**
- [ ] Funkcja `refreshFlashcards` działa
- [ ] Lista fiszek wyświetla się poprawnie
- [ ] Loading state działa
- [ ] Error handling działa
- [ ] Empty state wyświetla się gdy brak fiszek

---

##### Zadanie 4.4: Tworzenie fiszki

**Kroki:**

1. **Dodanie przycisku "Dodaj fiszkę":**
   
   Dodaj przed listą fiszek:
   
   ```typescript
   <div className="flex justify-between items-center">
     <h2 className="text-2xl font-semibold text-white">
       Wszystkie fiszki ({flashcards.length})
     </h2>
     <button
       onClick={() => {
         setShowAddForm(!showAddForm);
         setEditingCard(null);
         setFormData({ front: '', back: '', tags: '' });
       }}
       className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition shadow-lg"
     >
       {showAddForm ? 'Anuluj' : '+ Dodaj fiszkę'}
     </button>
   </div>
   ```

2. **Dodanie formularza tworzenia:**
   
   Dodaj przed listą (po przycisku):
   
   ```typescript
   {showAddForm && (
     <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
       <h3 className="text-xl font-bold mb-4 text-gray-800">Dodaj nową fiszkę</h3>
       <form onSubmit={handleAdd} className="space-y-4">
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
           <p className="mt-1 text-xs text-gray-500">Wpisz tagi oddzielone przecinkami (opcjonalnie)</p>
         </div>
         <div className="flex gap-3">
           <button
             type="submit"
             disabled={loading}
             className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
           >
             {loading ? 'Zapisywanie...' : 'Dodaj fiszkę'}
           </button>
           <button
             type="button"
             onClick={() => {
               setShowAddForm(false);
               setFormData({ front: '', back: '', tags: '' });
             }}
             className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-300 transition"
           >
             Anuluj
           </button>
         </div>
       </form>
     </div>
   )}
   ```

3. **Dodanie funkcji handleAdd:**
   
   ```typescript
   const handleAdd = async (e: React.FormEvent) => {
     e.preventDefault();
     setLoading(true);
     setError(null);

     try {
       // Konwersja tagów z stringa na array
       const tagsArray = formData.tags
         .split(',')
         .map((tag) => tag.trim())
         .filter((tag) => tag.length > 0);

       const { error } = await supabase.from('flashcards').insert({
         user_id: userId,
         front: formData.front,
         back: formData.back,
         tags: tagsArray,
       });

       if (error) throw error;

       // Reset form
       setFormData({ front: '', back: '', tags: '' });
       setShowAddForm(false);
       await refreshFlashcards();
     } catch (err: any) {
       setError(err.message || 'Błąd podczas dodawania fiszki');
     } finally {
       setLoading(false);
     }
   };
   ```

4. **Weryfikacja:**
   - Kliknij "Dodaj fiszkę"
   - Wypełnij formularz
   - Kliknij "Dodaj fiszkę"
   - Fiszka powinna się pojawić na liście

**Weryfikacja:**
- [ ] Przycisk "Dodaj fiszkę" działa
- [ ] Formularz wyświetla się poprawnie
- [ ] Walidacja działa (pola wymagane)
- [ ] Fiszka jest zapisywana do Supabase
- [ ] Lista odświeża się po dodaniu

---

##### Zadanie 4.5: Edycja fiszki

**Kroki:**

1. **Dodanie przycisku "Edytuj" do karty:**
   
   W wyświetlaniu karty, dodaj przyciski akcji:
   
   ```typescript
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
   ```

2. **Dodanie funkcji handleEdit:**
   
   ```typescript
   const handleEdit = (card: Flashcard) => {
     setEditingCard(card);
     setFormData({
       front: card.front,
       back: card.back,
       tags: card.tags.join(', '),
     });
     setShowAddForm(true);
   };
   ```

3. **Aktualizacja formularza dla trybu edycji:**
   
   Zmień nagłówek formularza:
   ```typescript
   <h3 className="text-xl font-bold mb-4 text-gray-800">
     {editingCard ? 'Edytuj fiszkę' : 'Dodaj nową fiszkę'}
   </h3>
   ```
   
   I zmień onSubmit:
   ```typescript
   <form onSubmit={editingCard ? handleUpdate : handleAdd} className="space-y-4">
   ```

4. **Dodanie funkcji handleUpdate:**
   
   ```typescript
   const handleUpdate = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!editingCard) return;

     setLoading(true);
     setError(null);

     try {
       const tagsArray = formData.tags
         .split(',')
         .map((tag) => tag.trim())
         .filter((tag) => tag.length > 0);

       const { error } = await supabase
         .from('flashcards')
         .update({
           front: formData.front,
           back: formData.back,
           tags: tagsArray,
         })
         .eq('id', editingCard.id)
         .eq('user_id', userId);

       if (error) throw error;

       // Reset form
       setEditingCard(null);
       setFormData({ front: '', back: '', tags: '' });
       setShowAddForm(false);
       await refreshFlashcards();
     } catch (err: any) {
       setError(err.message || 'Błąd podczas aktualizacji fiszki');
     } finally {
       setLoading(false);
     }
   };
   ```

5. **Weryfikacja:**
   - Kliknij "Edytuj" na fiszce
   - Formularz powinien być wypełniony danymi
   - Zmień dane i zapisz
   - Zmiany powinny być widoczne na liście

**Weryfikacja:**
- [ ] Przycisk "Edytuj" działa
- [ ] Formularz jest pre-filled z danymi fiszki
- [ ] Aktualizacja w Supabase działa
- [ ] Lista odświeża się po edycji

---

##### Zadanie 4.6: Usuwanie fiszki

**Kroki:**

1. **Dodanie funkcji handleDelete:**
   
   ```typescript
   const handleDelete = async (id: string) => {
     if (!confirm('Czy na pewno chcesz usunąć tę fiszkę?')) return;

     setLoading(true);
     setError(null);

     try {
       const { error } = await supabase
         .from('flashcards')
         .delete()
         .eq('id', id)
         .eq('user_id', userId);

       if (error) throw error;
       await refreshFlashcards();
     } catch (err: any) {
       setError(err.message || 'Błąd podczas usuwania fiszki');
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Przycisk "Usuń" jest już dodany w Zadaniu 4.5**

3. **Weryfikacja:**
   - Kliknij "Usuń" na fiszce
   - Potwierdź usunięcie
   - Fiszka powinna zniknąć z listy

**Weryfikacja:**
- [ ] Przycisk "Usuń" działa
- [ ] Potwierdzenie działa (confirm dialog)
- [ ] Usunięcie z Supabase działa
- [ ] Lista odświeża się po usunięciu

---

##### Zadanie 4.7: Filtrowanie i wyszukiwanie (opcjonalnie)

**Kroki:**

1. **Dodanie state dla wyszukiwania:**
   
   ```typescript
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedTag, setSelectedTag] = useState<string | null>(null);
   ```

2. **Dodanie inputu wyszukiwania:**
   
   Przed listą fiszek:
   
   ```typescript
   <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
     <div className="flex gap-4">
       <input
         type="text"
         value={searchQuery}
         onChange={(e) => setSearchQuery(e.target.value)}
         placeholder="Wyszukaj fiszki..."
         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
       />
       <select
         value={selectedTag || ''}
         onChange={(e) => setSelectedTag(e.target.value || null)}
         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
       >
         <option value="">Wszystkie tagi</option>
         {Array.from(new Set(flashcards.flatMap(c => c.tags || []))).map(tag => (
           <option key={tag} value={tag}>{tag}</option>
         ))}
       </select>
     </div>
   </div>
   ```

3. **Filtrowanie fiszek:**
   
   Przed wyświetleniem listy, dodaj filtrowanie:
   
   ```typescript
   const filteredFlashcards = flashcards.filter(card => {
     const matchesSearch = searchQuery === '' || 
       card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
       card.back.toLowerCase().includes(searchQuery.toLowerCase());
     
     const matchesTag = selectedTag === null || 
       (card.tags && card.tags.includes(selectedTag));
     
     return matchesSearch && matchesTag;
   });
   ```

4. **Użyj `filteredFlashcards` zamiast `flashcards` w mapowaniu**

5. **Weryfikacja:**
   - Wpisz tekst w wyszukiwarkę - lista powinna się filtrować
   - Wybierz tag - lista powinna się filtrować

**Weryfikacja:**
- [ ] Wyszukiwanie działa
- [ ] Filtrowanie po tagach działa
- [ ] Filtry działają razem (AND)

---

#### Weryfikacja etapu

Przed przejściem do Etapu 5, upewnij się że:

- [ ] Można wyświetlić listę fiszek (`/flashcards`)
- [ ] Można dodać nową fiszkę (formularz + zapis)
- [ ] Można edytować fiszkę (pre-filled formularz + aktualizacja)
- [ ] Można usunąć fiszkę (potwierdzenie + usunięcie)
- [ ] Wszystkie operacje działają poprawnie
- [ ] Loading states działają
- [ ] Error handling działa
- [ ] UI jest czytelne i responsywne

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 5!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Komponent FlashcardManager

```
Stwórz komponent FlashcardManager dla aplikacji 10xCards z pełnym CRUD:

Wymagania:
- Plik: src/components/FlashcardManager.tsx
- React component z TypeScript
- Props: userId (string)
- Operacje CRUD: Create, Read, Update, Delete
- Integracja z Supabase (tabela flashcards)
- State management: flashcards[], loading, error, showAddForm, editingCard, formData
- Formularz: front (textarea), back (textarea), tags (input, comma-separated)
- Wyświetlanie: grid layout z kartami fiszek
- Loading states i error handling
- Stylizacja z Tailwind CSS

Stack: Astro + React + TypeScript + Supabase + Tailwind CSS

Upewnij się, że:
- Wszystkie operacje używają user_id do filtrowania
- Formularz obsługuje zarówno dodawanie jak i edycję
- Tagi są konwertowane z stringa na array
- Lista odświeża się po każdej operacji CRUD
```

##### Troubleshooting

**Problem:** Błąd "new row violates row-level security policy"
- **Rozwiązanie:**
  - Sprawdź czy użytkownik jest zalogowany
  - Sprawdź czy używasz `user_id` w insert/update
  - Sprawdź czy RLS policies są poprawne w Supabase

**Problem:** Tagi nie są zapisywane
- **Rozwiązanie:**
  - Sprawdź czy konwersja string → array działa poprawnie
  - Sprawdź czy typ kolumny `tags` w Supabase to `text[]`
  - Upewnij się, że używasz `.split(',')` i `.filter()`

**Problem:** Lista nie odświeża się po operacji
- **Rozwiązanie:**
  - Sprawdź czy wywołujesz `refreshFlashcards()` po każdej operacji
  - Sprawdź czy `await` jest używane przed `refreshFlashcards()`
  - Sprawdź czy nie ma błędów w konsoli

**Problem:** Formularz edycji nie jest pre-filled
- **Rozwiązanie:**
  - Sprawdź czy `handleEdit` ustawia `editingCard` i `formData`
  - Sprawdź czy `formData` jest używane w `value` inputów
  - Sprawdź czy `setShowAddForm(true)` jest wywoływane

**Problem:** Usuwanie nie działa
- **Rozwiązanie:**
  - Sprawdź czy używasz `.eq('user_id', userId)` w delete
  - Sprawdź czy RLS policy dla DELETE jest włączona
  - Sprawdź czy `confirm()` zwraca `true`

---

### Etap 5: Generator AI
**Cel:** Implementacja generatora fiszek wykorzystującego AI (OpenRouter)

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 6-8 godzin

#### Zadania:

##### Zadanie 5.1: Klient OpenRouter

**Kroki:**

1. **Utworzenie konta OpenRouter (jeśli jeszcze nie masz):**
   - Przejdź na [openrouter.ai](https://openrouter.ai)
   - Zaloguj się lub utwórz konto
   - Przejdź do **Keys** i utwórz nowy klucz API
   - **WAŻNE:** Doładuj budżet ($10 wystarczy na POC)
   - Skopiuj klucz API (zaczyna się od `sk-or-v1-...`)

2. **Aktualizacja `.env`:**
   
   Dodaj klucz OpenRouter do `.env`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-twoj-klucz-tutaj
   ```
   
   **UWAGA:** `OPENROUTER_API_KEY` NIE zaczyna się od `PUBLIC_` - to klucz prywatny, używany tylko server-side!

3. **Utworzenie klienta OpenRouter:**
   
   Utwórz plik `src/lib/openrouter.ts`:
   
   ```typescript
   interface GeneratedFlashcard {
     front: string;
     back: string;
   }

   interface GeneratedFlashcardsResponse {
     flashcards: GeneratedFlashcard[];
   }

   export async function generateFlashcards(text: string): Promise<GeneratedFlashcard[]> {
     // 🔒 SECURITY: OPENROUTER_API_KEY jest PRYWATNYM kluczem - NIGDY nie commituj go do Git!
     const apiKey = String(import.meta.env.OPENROUTER_API_KEY || '').trim();
     
     if (!apiKey) {
       throw new Error(
         'OPENROUTER_API_KEY nie jest skonfigurowany.\n' +
         'Dodaj OPENROUTER_API_KEY do pliku .env\n' +
         'Pobierz klucz z: https://openrouter.ai/keys'
       );
     }

     if (!text || text.trim().length === 0) {
       throw new Error('Tekst nie może być pusty');
     }

     const prompt = `Na podstawie poniższego tekstu wygeneruj 5-15 fiszek edukacyjnych. 
   Każda fiszka ma mieć:
   - front: pytanie lub pojęcie
   - back: odpowiedź lub definicja

   Zwróć wynik TYLKO w formacie JSON, bez żadnych dodatkowych komentarzy:
   {
     "flashcards": [
       {"front": "...", "back": "..."},
       ...
     ]
   }

   Tekst:
   ${text}`;

     const messages = [
       {
         role: 'system' as const,
         content: 'Jesteś ekspertem od tworzenia wysokiej jakości fiszek edukacyjnych. Generujesz tylko poprawny JSON bez dodatkowych komentarzy.',
       },
       {
         role: 'user' as const,
         content: prompt,
       },
     ];

     try {
       const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${apiKey}`,
           'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
           'X-Title': '10xCards - Generator Fiszek',
         },
         body: JSON.stringify({
           model: 'openai/gpt-4o-mini', // Budżetowy model
           messages,
           temperature: 0.7,
           max_tokens: 2000,
         }),
       });

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(
           errorData.error?.message || `API Error: ${response.status} ${response.statusText}`
         );
       }

       const data = await response.json();

       if (data.error) {
         throw new Error(data.error.message);
       }

       if (!data.choices || data.choices.length === 0) {
         throw new Error('Brak odpowiedzi z API');
       }

       const content = data.choices[0].message.content.trim();

       if (!content) {
         throw new Error('Pusta odpowiedź z API');
       }

       // Wyciągnij JSON z odpowiedzi (usuwając markdown code blocks jeśli są)
       let jsonContent = content;
       if (content.includes('```json')) {
         jsonContent = content.split('```json')[1].split('```')[0].trim();
       } else if (content.includes('```')) {
         jsonContent = content.split('```')[1].split('```')[0].trim();
       }

       // Jeśli nadal nie ma JSON, spróbuj znaleźć { na początku
       const jsonStart = jsonContent.indexOf('{');
       const jsonEnd = jsonContent.lastIndexOf('}');
       if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
         jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
       }

       if (!jsonContent || jsonContent.length === 0) {
         throw new Error('Nie znaleziono JSON w odpowiedzi z AI');
       }

       let parsed: GeneratedFlashcardsResponse;
       try {
         parsed = JSON.parse(jsonContent);
       } catch (parseError: any) {
         throw new Error(`Błąd parsowania JSON: ${parseError.message}`);
       }

       if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
         throw new Error('Nieprawidłowy format odpowiedzi z AI');
       }

       return parsed.flashcards;
     } catch (error: any) {
       if (error instanceof SyntaxError) {
         throw new Error('Błąd parsowania odpowiedzi z AI. Spróbuj ponownie.');
       }
       throw error;
     }
   }
   ```

4. **Weryfikacja:**
   - Sprawdź czy plik się kompiluje
   - Sprawdź czy nie ma błędów TypeScript

**Weryfikacja:**
- [ ] Konto OpenRouter utworzone
- [ ] Klucz API dodany do `.env`
- [ ] Plik `src/lib/openrouter.ts` utworzony
- [ ] Funkcja `generateFlashcards` działa (będzie testowana w następnym zadaniu)

---

##### Zadanie 5.2: Endpoint API - generate-flashcards

**Kroki:**

1. **Utworzenie endpointu API:**
   
   Utwórz plik `src/pages/api/generate-flashcards.ts`:
   
   ```typescript
   import type { APIRoute } from 'astro';
   import { generateFlashcards } from '../../lib/openrouter';
   import { supabase } from '../../lib/supabase';

   // Wymagane dla endpointów API w Astro
   export const prerender = false;

   export const POST: APIRoute = async ({ request, cookies }) => {
     try {
       // Sprawdź autentykację (session cookie)
       const authToken = cookies.get('sb-access-token')?.value;
       
       // Alternatywnie, możesz użyć Supabase client do sprawdzenia sesji
       // W tym przypadku używamy prostszego podejścia - sprawdzamy czy request pochodzi z zalogowanego użytkownika
       // W praktyce, Supabase Auth automatycznie ustawia cookies, więc możemy sprawdzić sesję
       
       // Pobierz body
       if (!request.body) {
         return new Response(
           JSON.stringify({ error: 'Brak danych w żądaniu' }),
           { 
             status: 400,
             headers: { 'Content-Type': 'application/json' }
           }
         );
       }

       let requestData;
       try {
         requestData = await request.json();
       } catch (parseError: any) {
         return new Response(
           JSON.stringify({ error: 'Nieprawidłowy format danych JSON' }),
           { 
             status: 400,
             headers: { 'Content-Type': 'application/json' }
           }
         );
       }

       const { text } = requestData || {};

       if (!text || text.trim().length === 0) {
         return new Response(
           JSON.stringify({ error: 'Tekst nie może być pusty' }),
           { 
             status: 400,
             headers: { 'Content-Type': 'application/json' }
           }
         );
       }

       // Wygeneruj fiszki
       const flashcards = await generateFlashcards(text);

       return new Response(
         JSON.stringify({ flashcards }),
         {
           status: 200,
           headers: { 'Content-Type': 'application/json' }
         }
       );
     } catch (error: any) {
       console.error('API Error:', error);
       return new Response(
         JSON.stringify({ 
           error: error.message || 'Błąd generowania fiszek',
           details: import.meta.env.DEV ? error.stack : undefined
         }),
         {
           status: 500,
           headers: { 'Content-Type': 'application/json' }
         }
       );
     }
   };
   ```

   **UWAGA:** W praktyce, autentykacja przez session cookie w Astro SSR może wymagać dodatkowej konfiguracji. Dla uproszczenia, możesz na razie pominąć sprawdzanie auth w endpointzie (będzie sprawdzane w komponencie), ale w produkcji powinno być sprawdzane.

2. **Test endpointu:**
   
   Możesz przetestować endpoint używając curl lub Postman:
   ```bash
   curl -X POST http://localhost:4321/api/generate-flashcards \
     -H "Content-Type: application/json" \
     -d '{"text": "JavaScript to język programowania. Funkcje to bloki kodu."}'
   ```

3. **Weryfikacja:**
   - Endpoint zwraca fiszki w formacie JSON
   - Obsługa błędów działa

**Weryfikacja:**
- [ ] Plik `src/pages/api/generate-flashcards.ts` utworzony
- [ ] Endpoint zwraca fiszki w formacie JSON
- [ ] Walidacja inputu działa
- [ ] Error handling działa

---

##### Zadanie 5.3: Strona generatora

**Kroki:**

1. **Utworzenie strony generatora:**
   
   Utwórz plik `src/pages/generate.astro`:
   
   ```astro
   ---
   import '../styles/global.css';
   import AuthWrapper from '../components/AuthWrapper';
   import AIGenerator from '../components/AIGenerator';
   ---

   <html lang="pl">
     <head>
       <meta charset="utf-8" />
       <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Generator AI - 10xCards</title>
     </head>
     <body>
       <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-blue-600">
         <div class="max-w-5xl mx-auto">
           <!-- Header -->
           <header class="mb-8 flex items-center justify-between">
             <div>
               <h1 class="text-4xl font-bold text-white mb-2">Generator AI</h1>
               <p class="text-white/80">Wygeneruj fiszki z dowolnego tekstu używając AI</p>
             </div>
             <a
               href="/dashboard"
               class="text-white hover:text-gray-200 px-4 py-2 rounded-lg hover:bg-white/10 transition"
             >
               ← Dashboard
             </a>
           </header>

           <!-- AI Generator Component -->
           <AuthWrapper client:load>
             <AIGenerator client:load />
           </AuthWrapper>
         </div>
       </div>
     </body>
   </html>
   ```

2. **Weryfikacja:**
   - Otwórz `http://localhost:4321/generate`
   - Strona powinna się wyświetlić (na razie bez komponentu)

**Weryfikacja:**
- [ ] Strona `/generate` jest dostępna
- [ ] Strona wymaga logowania (przekierowanie do `/login`)
- [ ] Header wyświetla się poprawnie

---

##### Zadanie 5.4: Komponent AIGenerator - Podstawowa struktura

**Kroki:**

1. **Utworzenie komponentu AIGenerator:**
   
   Utwórz plik `src/components/AIGenerator.tsx` z podstawową strukturą:
   
   ```typescript
   import { useState } from 'react';

   interface GeneratedFlashcard {
     front: string;
     back: string;
   }

   export default function AIGenerator() {
     const [text, setText] = useState('');
     const [generating, setGenerating] = useState(false);
     const [flashcards, setFlashcards] = useState<GeneratedFlashcard[]>([]);
     const [error, setError] = useState<string | null>(null);

     const handleGenerate = async (e: React.FormEvent) => {
       e.preventDefault();
       setGenerating(true);
       setError(null);
       setFlashcards([]);

       try {
         const response = await fetch('/api/generate-flashcards', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ text }),
         });

         if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           throw new Error(errorData.error || `Błąd: ${response.status}`);
         }

         const data = await response.json();
         setFlashcards(data.flashcards || []);
       } catch (err: any) {
         setError(err.message || 'Błąd podczas generowania fiszek');
       } finally {
         setGenerating(false);
       }
     };

     return (
       <div className="space-y-6">
         {/* Formularz */}
         <div className="bg-white rounded-2xl shadow-xl p-6">
           <h2 className="text-2xl font-semibold mb-4 text-gray-800">Wklej tekst</h2>
           <form onSubmit={handleGenerate} className="space-y-4">
             <div>
               <textarea
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 required
                 rows={10}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                 placeholder="Wklej tutaj tekst, z którego chcesz wygenerować fiszki..."
               />
               <p className="mt-2 text-sm text-gray-500">
                 AI przeanalizuje tekst i wygeneruje 5-15 fiszek edukacyjnych
               </p>
             </div>

             {error && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                 {error}
               </div>
             )}

             <button
               type="submit"
               disabled={generating || !text.trim()}
               className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
             >
               {generating ? '⚡ Generowanie...' : '🤖 Generuj fiszki'}
             </button>
           </form>
         </div>

         {/* Wyniki */}
         {flashcards.length > 0 && (
           <div className="bg-white rounded-2xl shadow-xl p-6">
             <h2 className="text-2xl font-semibold text-gray-800 mb-4">
               Wygenerowane fiszki ({flashcards.length})
             </h2>
             <div className="space-y-4">
               {flashcards.map((card, index) => (
                 <div key={index} className="border border-gray-200 rounded-xl p-4">
                   <div className="mb-2">
                     <span className="text-xs text-gray-500 font-medium">Pytanie:</span>
                     <p className="font-semibold text-gray-900 mt-1">{card.front}</p>
                   </div>
                   <div>
                     <span className="text-xs text-gray-500 font-medium">Odpowiedź:</span>
                     <p className="text-gray-700 mt-1">{card.back}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* Loading overlay */}
         {generating && (
           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
               <div className="text-4xl mb-4 animate-bounce">⚡</div>
               <h3 className="text-xl font-semibold text-gray-800 mb-2">Generowanie fiszek...</h3>
               <p className="text-gray-600">To może chwilę potrwać</p>
             </div>
           </div>
         )}
       </div>
     );
   }
   ```

2. **Weryfikacja:**
   - Otwórz `/generate`
   - Wypełnij formularz i wygeneruj fiszki
   - Sprawdź czy fiszki się wyświetlają

**Weryfikacja:**
- [ ] Komponent `AIGenerator.tsx` utworzony
- [ ] Formularz działa
- [ ] Generowanie fiszek działa
- [ ] Loading state działa
- [ ] Error handling działa

---

##### Zadanie 5.5: Review i wybór fiszek

**Kroki:**

1. **Dodanie state dla wyboru fiszek:**
   
   W `AIGenerator.tsx`, dodaj:
   ```typescript
   const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
   const [saving, setSaving] = useState(false);
   const [success, setSuccess] = useState<string | null>(null);
   ```

2. **Dodanie funkcji do zarządzania wyborem:**
   
   ```typescript
   const toggleCard = (index: number) => {
     const newSelected = new Set(selectedCards);
     if (newSelected.has(index)) {
       newSelected.delete(index);
     } else {
       newSelected.add(index);
     }
     setSelectedCards(newSelected);
   };

   const selectAll = () => {
     setSelectedCards(new Set(flashcards.map((_, idx) => idx)));
   };

   const deselectAll = () => {
     setSelectedCards(new Set());
   };
   ```

3. **Aktualizacja wyświetlania fiszek z checkboxami:**
   
   Zastąp sekcję "Wyniki":
   
   ```typescript
   {flashcards.length > 0 && (
     <div className="bg-white rounded-2xl shadow-xl p-6">
       <div className="flex items-center justify-between mb-6">
         <h2 className="text-2xl font-semibold text-gray-800">
           Wygenerowane fiszki ({flashcards.length})
         </h2>
         <div className="flex gap-2">
           <button
             onClick={selectAll}
             className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
           >
             Zaznacz wszystkie
           </button>
           <button
             onClick={deselectAll}
             className="px-4 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
           >
             Odznacz wszystkie
           </button>
         </div>
       </div>

       <div className="space-y-4 mb-6">
         {flashcards.map((card, index) => (
           <div
             key={index}
             className={`border-2 rounded-xl p-4 transition ${
               selectedCards.has(index)
                 ? 'border-purple-500 bg-purple-50'
                 : 'border-gray-200 bg-white'
             }`}
           >
             <div className="flex items-start gap-3">
               <input
                 type="checkbox"
                 checked={selectedCards.has(index)}
                 onChange={() => toggleCard(index)}
                 className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
               />
               <div className="flex-1">
                 <div className="mb-2">
                   <span className="text-xs text-gray-500 font-medium">Pytanie:</span>
                   <p className="font-semibold text-gray-900 mt-1">{card.front}</p>
                 </div>
                 <div>
                   <span className="text-xs text-gray-500 font-medium">Odpowiedź:</span>
                   <p className="text-gray-700 mt-1">{card.back}</p>
                 </div>
               </div>
             </div>
           </div>
         ))}
       </div>

       <button
         onClick={handleSave}
         disabled={saving || selectedCards.size === 0}
         className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50"
       >
         {saving
           ? '💾 Zapisywanie...'
           : `✅ Zapisz wybrane (${selectedCards.size}/${flashcards.length})`}
       </button>
     </div>
   )}
   ```

4. **Dodanie funkcji handleSave:**
   
   ```typescript
   const handleSave = async () => {
     if (selectedCards.size === 0) {
       setError('Wybierz przynajmniej jedną fiszkę do zapisania');
       return;
     }

     setSaving(true);
     setError(null);
     setSuccess(null);

     try {
       // Pobierz aktualnego użytkownika
       const { data: { session } } = await supabase.auth.getSession();

       if (!session) {
         throw new Error('Musisz być zalogowany aby zapisać fiszki');
       }

       // Przygotuj fiszki do zapisania
       const cardsToSave = flashcards.filter((_, idx) => selectedCards.has(idx));

       const { error: insertError } = await supabase.from('flashcards').insert(
         cardsToSave.map((card) => ({
           user_id: session.user.id,
           front: card.front,
           back: card.back,
           tags: [],
         }))
       );

       if (insertError) throw insertError;

       setSuccess(`Zapisano ${cardsToSave.length} fiszek!`);
       
       // Wyczyść formularz i wyniki po 2 sekundach
       setTimeout(() => {
         setText('');
         setFlashcards([]);
         setSelectedCards(new Set());
         setSuccess(null);
       }, 2000);
     } catch (err: any) {
       setError(err.message || 'Błąd podczas zapisywania fiszek');
     } finally {
       setSaving(false);
     }
   };
   ```

   I dodaj import:
   ```typescript
   import { supabase } from '../lib/supabase';
   ```

5. **Dodanie automatycznego zaznaczania wszystkich po wygenerowaniu:**
   
   W `handleGenerate`, po `setFlashcards(data.flashcards || [])`, dodaj:
   ```typescript
   // Automatycznie zaznacz wszystkie
   setSelectedCards(new Set(data.flashcards.map((_: any, idx: number) => idx)));
   ```

6. **Dodanie komunikatu sukcesu:**
   
   W formularzu, przed przyciskiem "Generuj fiszki", dodaj:
   ```typescript
   {success && (
     <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
       {success}
     </div>
   )}
   ```

7. **Weryfikacja:**
   - Wygeneruj fiszki
   - Sprawdź czy wszystkie są zaznaczone
   - Odznacz niektóre
   - Zapisz wybrane
   - Sprawdź czy zapisały się w bazie

**Weryfikacja:**
- [ ] Checkboxy działają
- [ ] Zaznacz/odznacz wszystkie działa
- [ ] Zapisywanie wybranych fiszek działa
- [ ] Komunikat sukcesu wyświetla się
- [ ] Formularz czyści się po zapisaniu

---

#### Weryfikacja etapu

Przed przejściem do Etapu 6, upewnij się że:

- [ ] Można wygenerować fiszki z tekstu (`/generate`)
- [ ] AI zwraca poprawne fiszki (5-15 fiszek)
- [ ] Można wybrać które fiszki zapisać (checkboxy)
- [ ] Wybrane fiszki są zapisywane do bazy danych
- [ ] Wszystko działa end-to-end
- [ ] Loading states działają
- [ ] Error handling działa

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 6!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Klient OpenRouter

```
Stwórz klienta OpenRouter dla generowania fiszek w aplikacji 10xCards:

Wymagania:
- Plik: src/lib/openrouter.ts
- Funkcja generateFlashcards(text: string): Promise<GeneratedFlashcard[]>
- Integracja z OpenRouter API (https://openrouter.ai/api/v1/chat/completions)
- Model: openai/gpt-4o-mini (budżetowy)
- Prompt: generowanie 5-15 fiszek edukacyjnych z tekstu
- Format odpowiedzi: JSON z polem "flashcards" zawierającym array {front, back}
- Parsowanie odpowiedzi (obsługa markdown code blocks)
- Error handling z pomocnymi komunikatami
- Zmienna środowiskowa: OPENROUTER_API_KEY (bez PUBLIC_ - prywatny klucz)

Stack: TypeScript + OpenRouter API

Upewnij się, że:
- Klucz API jest używany tylko server-side
- Parsowanie JSON obsługuje różne formaty odpowiedzi z AI
- Błędy są czytelne i pomocne
```

##### Prompt dla Cursor IDE - Komponent AIGenerator

```
Stwórz komponent AIGenerator dla aplikacji 10xCards:

Wymagania:
- Plik: src/components/AIGenerator.tsx
- React component z TypeScript
- Formularz z textarea do wklejenia tekstu
- Wywołanie endpointu /api/generate-flashcards
- Wyświetlanie wygenerowanych fiszek z checkboxami
- Funkcje: selectAll, deselectAll, toggleCard
- Zapisywanie wybranych fiszek do Supabase
- Loading states (generating, saving)
- Error handling i komunikaty sukcesu
- Stylizacja z Tailwind CSS

Stack: Astro + React + TypeScript + Supabase + Tailwind CSS

Upewnij się, że:
- Automatyczne zaznaczanie wszystkich po wygenerowaniu
- Formularz czyści się po zapisaniu
- Wszystkie operacje używają user_id z sesji
```

##### Troubleshooting

**Problem:** Błąd "OPENROUTER_API_KEY nie jest skonfigurowany"
- **Rozwiązanie:**
  - Sprawdź czy klucz jest w `.env` (bez `PUBLIC_`)
  - Sprawdź czy zrestartowałeś serwer dev po dodaniu klucza
  - Sprawdź czy klucz jest poprawny (zaczyna się od `sk-or-v1-`)

**Problem:** Błąd "API Error: 401" lub "Unauthorized"
- **Rozwiązanie:**
  - Sprawdź czy klucz API jest poprawny
  - Sprawdź czy masz doładowany budżet w OpenRouter
  - Sprawdź czy klucz nie wygasł

**Problem:** Błąd parsowania JSON
- **Rozwiązanie:**
  - Sprawdź czy parser obsługuje markdown code blocks
  - Sprawdź czy AI zwraca poprawny format JSON
  - Dodaj więcej logowania w trybie DEV

**Problem:** AI nie generuje fiszek
- **Rozwiązanie:**
  - Sprawdź czy tekst nie jest zbyt krótki
  - Sprawdź czy model jest dostępny w OpenRouter
  - Sprawdź czy nie przekroczyłeś limitu tokenów

**Problem:** Zapisywanie fiszek nie działa
- **Rozwiązanie:**
  - Sprawdź czy użytkownik jest zalogowany
  - Sprawdź czy używasz `user_id` w insert
  - Sprawdź czy RLS policies są poprawne
  - Sprawdź czy `selectedCards` nie jest pusty

---

### Etap 6: System Powtórek (Spaced Repetition)
**Cel:** Implementacja systemu powtórek z algorytmem SM-2 lite

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 10-12 godzin

#### Zadania:

##### Zadanie 6.1: Algorytm SM-2 lite

**Kroki:**

1. **Utworzenie modułu scheduling:**
   
   Utwórz plik `src/lib/scheduling.ts`:
   
   ```typescript
   export type Grade = 0 | 1 | 2 | 3;

   export interface SchedulingState {
     ease: number;
     intervalDays: number;
     repetitions: number;
   }

   export interface GradeInput extends SchedulingState {
     grade: Grade;
   }

   export interface GradeResult {
     nextEase: number;
     nextIntervalDays: number;
     nextRepetitions: number;
   }

   /**
    * Algorytm SM-2 lite: oblicza nowy stan harmonogramu na podstawie oceny
    * 
    * Oceny:
    * - 0 (Again): Reset repetitions, zmniejsz ease o 20
    * - 1 (Hard): Zwiększ repetitions, mały interval
    * - 2 (Good): Zwiększ repetitions, normalny interval (główny flow)
    * - 3 (Easy): Zwiększ repetitions, duży interval, zwiększ ease
    */
   export function gradeAnswer(input: GradeInput): GradeResult {
     const { ease, intervalDays, repetitions, grade } = input;
     const minEase = 130;

     // Ocena < 2 (Again lub Hard): reset repetitions, zmniejsz ease
     if (grade < 2) {
       const nextEase = Math.max(minEase, ease - 20);
       return { nextEase, nextIntervalDays: 1, nextRepetitions: 0 };
     }

     // Ocena >= 2 (Good lub Easy): zwiększ repetitions i ease
     const delta = grade - 2; // 0 dla Good, 1 dla Easy
     const nextEase = Math.max(minEase, ease + delta * 10);
     const nextRepetitions = repetitions + 1;

     let nextIntervalDays: number;
     if (nextRepetitions === 1) {
       nextIntervalDays = 1;
     } else if (nextRepetitions === 2) {
       nextIntervalDays = 3;
     } else {
       // Dla repetitions > 2: interval = poprzedni_interval * (ease / 100)
       nextIntervalDays = Math.max(1, Math.round(intervalDays * (nextEase / 100)));
     }

     return { nextEase, nextIntervalDays, nextRepetitions };
   }

   /**
    * Oblicza datę następnej powtórki na podstawie liczby dni
    */
   export function nextDueAt(intervalDays: number, from: Date = new Date()): Date {
     const due = new Date(from.getTime());
     due.setUTCDate(due.getUTCDate() + Math.max(0, intervalDays));
     return due;
   }
   ```

2. **Weryfikacja:**
   - Sprawdź czy plik się kompiluje
   - Sprawdź czy nie ma błędów TypeScript

**Weryfikacja:**
- [ ] Plik `src/lib/scheduling.ts` utworzony
- [ ] Funkcja `gradeAnswer` działa poprawnie
- [ ] Funkcja `nextDueAt` działa poprawnie
- [ ] Typy TypeScript są poprawne

---

##### Zadanie 6.2: Endpoint API - review/next

**Kroki:**

1. **Utworzenie endpointu:**
   
   Utwórz plik `src/pages/api/review/next.ts`:
   
   ```typescript
   import type { APIRoute } from 'astro';
   import { createClient } from '@supabase/supabase-js';

   export const prerender = false;

   function getUserSupabaseClient(request: Request) {
     const supabaseUrl = String(import.meta.env.PUBLIC_SUPABASE_URL || '').trim();
     const supabaseAnonKey = String(import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();
     const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
     const client = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: authHeader ? { Authorization: authHeader } : {} }
     });
     return client;
   }

   export const GET: APIRoute = async ({ request }) => {
     try {
       const client = getUserSupabaseClient(request);
       const userRes = await client.auth.getUser();
       
       if (userRes.error || !userRes.data.user) {
         return new Response(
           JSON.stringify({ error: 'Unauthorized' }),
           { status: 401, headers: { 'Content-Type': 'application/json' } }
         );
       }

       const userId = userRes.data.user.id;
       const nowIso = new Date().toISOString();
       
       // Sprawdź parametr force z URL
       const url = new URL(request.url);
       const force = url.searchParams.get('force') === 'true';

       let cards: any[] = [];

       if (force) {
         // Tryb force: zwróć wszystkie dostępne karty użytkownika (max 20)
         const { data: allCards, error: fcErr } = await client
           .from('flashcards')
           .select('id, front, back')
           .eq('user_id', userId)
           .order('created_at', { ascending: false })
           .limit(20);
         
         if (fcErr) {
           console.error('flashcards error:', fcErr);
           return new Response(
             JSON.stringify({ error: 'Błąd pobierania fiszek' }),
             { status: 500, headers: { 'Content-Type': 'application/json' } }
           );
         }
         cards = allCards || [];
       } else {
         // Tryb normalny: tylko należne karty (due_at <= now)
         const { data: dueSched, error: dueErr } = await client
           .from('card_scheduling')
           .select('card_id, due_at, updated_at')
           .eq('user_id', userId)
           .lte('due_at', nowIso)
           .order('due_at', { ascending: true })
           .order('updated_at', { ascending: true })
           .limit(40);

         if (dueErr) {
           console.error('card_scheduling error:', dueErr);
           return new Response(
             JSON.stringify({ error: 'Błąd pobierania harmonogramu' }),
             { status: 500, headers: { 'Content-Type': 'application/json' } }
           );
         }

         const dueIds = (dueSched || []).map((r) => r.card_id);

         if (dueIds.length > 0) {
           const { data: dueCards, error: fcErr } = await client
             .from('flashcards')
             .select('id, front, back')
             .eq('user_id', userId)
             .in('id', dueIds)
             .limit(20);
           
           if (fcErr) {
             console.error('flashcards due error:', fcErr);
             return new Response(
               JSON.stringify({ error: 'Błąd pobierania fiszek' }),
               { status: 500, headers: { 'Content-Type': 'application/json' } }
             );
           }
           cards = dueCards || [];
         }

         // Jeśli mniej niż 20 należnych kart, dodaj nowe karty (bez harmonogramu)
         if (cards.length < 20) {
           const { data: schedAll } = await client
             .from('card_scheduling')
             .select('card_id')
             .eq('user_id', userId)
             .limit(500);
           
           const scheduledSet = new Set((schedAll || []).map((r) => r.card_id));
           
           const { data: recentCards } = await client
             .from('flashcards')
             .select('id, front, back')
             .eq('user_id', userId)
             .order('created_at', { ascending: true })
             .limit(200);
           
           if (recentCards && recentCards.length) {
             for (const c of recentCards) {
               if (!scheduledSet.has(c.id)) {
                 cards.push(c);
                 if (cards.length >= 20) break;
               }
             }
           }
         }
       }

       return new Response(
         JSON.stringify({ cards: cards.slice(0, 20) }),
         { status: 200, headers: { 'Content-Type': 'application/json' } }
       );
     } catch (error: any) {
       console.error('❌ review/next error:', error);
       return new Response(
         JSON.stringify({ error: error.message || 'Błąd pobierania kart do powtórki' }),
         { status: 500, headers: { 'Content-Type': 'application/json' } }
       );
     }
   };
   ```

2. **Weryfikacja:**
   - Przetestuj endpoint używając curl lub Postman
   - Sprawdź czy zwraca należne karty

**Weryfikacja:**
- [ ] Plik `src/pages/api/review/next.ts` utworzony
- [ ] Endpoint wymaga autentykacji (Bearer token)
- [ ] Zwraca należne karty (due_at <= now)
- [ ] Tryb force zwraca wszystkie karty
- [ ] Dodaje nowe karty jeśli brak należnych

---

##### Zadanie 6.3: Endpoint API - review/submit

**Kroki:**

1. **Utworzenie endpointu:**
   
   Utwórz plik `src/pages/api/review/submit.ts`:
   
   ```typescript
   import type { APIRoute } from 'astro';
   import { createClient } from '@supabase/supabase-js';
   import { gradeAnswer, nextDueAt } from '../../../lib/scheduling';

   export const prerender = false;

   function getUserSupabaseClient(request: Request) {
     const supabaseUrl = String(import.meta.env.PUBLIC_SUPABASE_URL || '').trim();
     const supabaseAnonKey = String(import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();
     const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
     const client = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: authHeader ? { Authorization: authHeader } : {} }
     });
     return client;
   }

   export const POST: APIRoute = async ({ request }) => {
     try {
       const client = getUserSupabaseClient(request);
       const userRes = await client.auth.getUser();
       
       if (userRes.error || !userRes.data.user) {
         return new Response(
           JSON.stringify({ error: 'Unauthorized' }),
           { status: 401, headers: { 'Content-Type': 'application/json' } }
         );
       }

       const userId = userRes.data.user.id;

       // Parsuj body
       let body: any;
       try {
         body = await request.json();
       } catch {
         return new Response(
           JSON.stringify({ error: 'Nieprawidłowe JSON body' }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       const { cardId, grade } = body || {};
       
       // Walidacja
       if (!cardId || typeof grade !== 'number' || grade < 0 || grade > 3) {
         return new Response(
           JSON.stringify({ error: 'Wymagane: { cardId, grade: 0..3 }' }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       // Pobierz aktualny stan harmonogramu (lub wartości domyślne)
       const { data: schedRow } = await client
         .from('card_scheduling')
         .select('ease, interval_days, repetitions')
         .eq('user_id', userId)
         .eq('card_id', cardId)
         .maybeSingle();

       const current = {
         ease: schedRow?.ease ?? 250,
         intervalDays: schedRow?.interval_days ?? 0,
         repetitions: schedRow?.repetitions ?? 0,
       };

       // Oblicz nowy stan używając algorytmu SM-2 lite
       const result = gradeAnswer({ ...current, grade });
       const dueAt = nextDueAt(result.nextIntervalDays);

       // Aktualizuj harmonogram
       const { error: upsertErr } = await client
         .from('card_scheduling')
         .upsert({
           card_id: cardId,
           user_id: userId,
           ease: result.nextEase,
           interval_days: result.nextIntervalDays,
           repetitions: result.nextRepetitions,
           due_at: dueAt.toISOString(),
           updated_at: new Date().toISOString(),
         }, { onConflict: 'card_id' });

       if (upsertErr) {
         console.error('sched upsert error:', upsertErr);
         return new Response(
           JSON.stringify({ error: 'Błąd zapisu harmonogramu' }),
           { status: 500, headers: { 'Content-Type': 'application/json' } }
         );
       }

       // Zapisz historię oceny
       const { error: histErr } = await client
         .from('card_reviews')
         .insert({
           user_id: userId,
           card_id: cardId,
           grade,
           prev_interval_days: current.intervalDays,
           new_interval_days: result.nextIntervalDays,
           prev_ease: current.ease,
           new_ease: result.nextEase,
         });

       if (histErr) {
         console.error('history insert error:', histErr);
         // Nie zwracamy błędu - historia jest opcjonalna
       }

       return new Response(
         JSON.stringify({
           cardId,
           next: {
             ease: result.nextEase,
             intervalDays: result.nextIntervalDays,
             repetitions: result.nextRepetitions,
             dueAt: dueAt.toISOString(),
           },
         }),
         { status: 200, headers: { 'Content-Type': 'application/json' } }
       );
     } catch (error: any) {
       console.error('❌ review/submit error:', error);
       return new Response(
         JSON.stringify({ error: error.message || 'Błąd zapisu odpowiedzi' }),
         { status: 500, headers: { 'Content-Type': 'application/json' } }
       );
     }
   };
   ```

2. **Weryfikacja:**
   - Przetestuj endpoint z różnymi ocenami (0, 1, 2, 3)
   - Sprawdź czy harmonogram jest aktualizowany
   - Sprawdź czy historia jest zapisywana

**Weryfikacja:**
- [ ] Plik `src/pages/api/review/submit.ts` utworzony
- [ ] Endpoint wymaga autentykacji
- [ ] Walidacja inputu działa
- [ ] Harmonogram jest aktualizowany
- [ ] Historia jest zapisywana do `card_reviews`

---

##### Zadanie 6.4: Endpoint API - review/session-complete

**Kroki:**

1. **Utworzenie endpointu:**
   
   Utwórz plik `src/pages/api/review/session-complete.ts`:
   
   ```typescript
   import type { APIRoute } from 'astro';
   import { createClient } from '@supabase/supabase-js';

   export const prerender = false;

   function getUserSupabaseClient(request: Request) {
     const supabaseUrl = String(import.meta.env.PUBLIC_SUPABASE_URL || '').trim();
     const supabaseAnonKey = String(import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();
     const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
     const client = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: authHeader ? { Authorization: authHeader } : {} }
     });
     return client;
   }

   export const POST: APIRoute = async ({ request }) => {
     try {
       const client = getUserSupabaseClient(request);
       const userRes = await client.auth.getUser();
       
       if (userRes.error || !userRes.data.user) {
         return new Response(
           JSON.stringify({ error: 'Unauthorized' }),
           { status: 401, headers: { 'Content-Type': 'application/json' } }
         );
       }
       
       const userId = userRes.data.user.id;

       // Parsuj body
       let body: any;
       try {
         body = await request.json();
       } catch {
         return new Response(
           JSON.stringify({ error: 'Nieprawidłowe JSON body' }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       const { cardsReviewed, cardsCorrect } = body || {};
       
       // Walidacja
       if (typeof cardsReviewed !== 'number' || typeof cardsCorrect !== 'number' ||
           cardsReviewed < 0 || cardsCorrect < 0 || cardsCorrect > cardsReviewed) {
         return new Response(
           JSON.stringify({
             error: 'Wymagane: { cardsReviewed: number >= 0, cardsCorrect: number >= 0 && <= cardsReviewed }'
           }),
           { status: 400, headers: { 'Content-Type': 'application/json' } }
         );
       }

       // Zapisz sesję do review_sessions
       // Kolumna accuracy zostanie obliczona automatycznie przez computed column
       const { data, error: insertError } = await client
         .from('review_sessions')
         .insert({
           user_id: userId,
           completed_at: new Date().toISOString(),
           cards_reviewed: cardsReviewed,
           cards_correct: cardsCorrect,
         })
         .select()
         .single();

       if (insertError) {
         console.error('❌ Błąd zapisu sesji powtórek:', insertError);
         return new Response(
           JSON.stringify({ error: 'Błąd zapisu sesji powtórek' }),
           { status: 500, headers: { 'Content-Type': 'application/json' } }
         );
       }

       return new Response(
         JSON.stringify({
           id: data.id,
           completed_at: data.completed_at,
           cards_reviewed: data.cards_reviewed,
           cards_correct: data.cards_correct,
           accuracy: data.accuracy,
         }),
         { status: 200, headers: { 'Content-Type': 'application/json' } }
       );
     } catch (error: any) {
       console.error('❌ session-complete error:', error);
       return new Response(
         JSON.stringify({ error: error.message || 'Błąd zapisu sesji' }),
         { status: 500, headers: { 'Content-Type': 'application/json' } }
       );
     }
   };
   ```

2. **Weryfikacja:**
   - Przetestuj endpoint z poprawnymi danymi
   - Sprawdź czy sesja jest zapisywana

**Weryfikacja:**
- [ ] Plik `src/pages/api/review/session-complete.ts` utworzony
- [ ] Endpoint wymaga autentykacji
- [ ] Walidacja inputu działa
- [ ] Sesja jest zapisywana do `review_sessions`
- [ ] Kolumna `accuracy` jest obliczana automatycznie

---

##### Zadanie 6.5: Strona powtórek

**Kroki:**

1. **Utworzenie strony powtórek:**
   
   Utwórz plik `src/pages/review.astro`:
   
   ```astro
   ---
   import '../styles/global.css';
   import AuthWrapper from '../components/AuthWrapper';
   import ReviewSession from '../components/ReviewSession';
   ---

   <html lang="pl">
     <head>
       <meta charset="utf-8" />
       <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
       <meta http-equiv="Pragma" content="no-cache" />
       <meta http-equiv="Expires" content="0" />
       <title>Powtórki - 10xCards</title>
     </head>
     <body>
       <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500 to-purple-600">
         <div class="max-w-5xl mx-auto">
           <header class="mb-8">
             <div class="flex items-center justify-between mb-4">
               <div>
                 <h1 class="text-4xl font-bold text-white mb-2">Powtórki</h1>
                 <p class="text-white/80">Rozwiązuj należne karty i utrwalaj wiedzę</p>
               </div>
               <a
                 href="/dashboard"
                 class="text-white hover:text-gray-200 px-4 py-2 rounded-lg hover:bg-white/10 transition"
               >
                 ← Dashboard
               </a>
             </div>
           </header>

           <AuthWrapper client:load>
             <ReviewSession client:load />
           </AuthWrapper>
         </div>
       </div>
     </body>
   </html>
   ```

2. **Weryfikacja:**
   - Otwórz `http://localhost:4321/review`
   - Strona powinna się wyświetlić

**Weryfikacja:**
- [ ] Strona `/review` jest dostępna
- [ ] Strona wymaga logowania
- [ ] Header wyświetla się poprawnie

---

##### Zadanie 6.6: Komponent ReviewSession

**Kroki:**

1. **Utworzenie komponentu ReviewSession:**
   
   Utwórz plik `src/components/ReviewSession.tsx`:
   
   ```typescript
   import { useEffect, useMemo, useRef, useState } from 'react';
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
         const { data: { session }, error } = await supabase.auth.getSession();
         if (error || !session) {
           const redirectTo = encodeURIComponent('/review');
           window.location.href = `/login?redirect=${redirectTo}`;
           return;
         }
         setUser(session.user);
         await loadQueue(session.access_token);
         setLoading(false);
       })();
     }, []);

     const loadQueue = async (accessToken: string, force: boolean = false) => {
       abortRef.current?.abort();
       abortRef.current = new AbortController();
       const url = force ? '/api/review/next?force=true' : '/api/review/next';
       const res = await fetch(url, {
         method: 'GET',
         headers: { Authorization: `Bearer ${accessToken}` },
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

     const submitGrade = async (grade: 0 | 1 | 2 | 3) => {
       const { data: { session } } = await supabase.auth.getSession();
       if (!session || !current) return;
       
       const res = await fetch('/api/review/submit', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${session.access_token}`,
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
     };

     // Obsługa klawiatury
     useEffect(() => {
       const onKey = (e: KeyboardEvent) => {
         if (!current) return;
         if (e.key === ' ') {
           e.preventDefault();
           setFlipped((f) => !f);
         }
         const k = e.key.toLowerCase();
         const map: Record<string, 0 | 1 | 2 | 3> = {
           '1': 0, 'a': 0,
           '2': 1, 'h': 1,
           '3': 2, 'g': 2,
           '4': 3, 'e': 3,
         };
         if (k in map) submitGrade(map[k]);
       };
       window.addEventListener('keydown', onKey);
       return () => window.removeEventListener('keydown', onKey);
     }, [current]);

     // Zapisz sesję gdy wszystkie karty zostały przejrzane
     useEffect(() => {
       const saveSession = async () => {
         if (queue.length === 0 && sessionStats.cardsReviewed > 0 && !sessionSaved) {
           setSessionSaved(true);
           const { data: { session } } = await supabase.auth.getSession();
           if (!session) return;

           try {
             const res = await fetch('/api/review/session-complete', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 Authorization: `Bearer ${session.access_token}`,
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
                   const { data: { session } } = await supabase.auth.getSession();
                   if (session) {
                     setLoading(true);
                     await loadQueue(session.access_token, true); // force = true
                     setLoading(false);
                   }
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
           <div className="text-lg whitespace-pre-wrap text-white">
             {!flipped ? current.front : current.back}
           </div>
           <div className="mt-4 flex gap-2 flex-wrap">
             <button
               className="px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
               onClick={() => submitGrade(0)}
             >
               Again (1/A)
             </button>
             <button
               className="px-3 py-2 rounded bg-orange-600 hover:bg-orange-700 text-white"
               onClick={() => submitGrade(1)}
             >
               Hard (2/H)
             </button>
             <button
               className="px-3 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
               onClick={() => submitGrade(2)}
             >
               Good (3/G)
             </button>
             <button
               className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white"
               onClick={() => submitGrade(3)}
             >
               Easy (4/E)
             </button>
             <button
               className="ml-auto px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white"
               onClick={() => setFlipped((f) => !f)}
             >
               {flipped ? 'Pokaż front (Space)' : 'Pokaż back (Space)'}
             </button>
           </div>
         </div>
       </div>
     );
   }
   ```

2. **Weryfikacja:**
   - Otwórz `/review`
   - Sprawdź czy karty się wyświetlają
   - Sprawdź czy można ocenić kartę
   - Sprawdź czy sesja jest zapisywana

**Weryfikacja:**
- [ ] Komponent `ReviewSession.tsx` utworzony
- [ ] Karty są pobierane z API
- [ ] UI sesji działa (pytanie → odpowiedź → ocena)
- [ ] Przyciski oceny działają
- [ ] Obsługa klawiatury działa (Space, 1-4, A/H/G/E)
- [ ] Licznik postępu działa
- [ ] Sesja jest zapisywana po zakończeniu

---

#### Weryfikacja etapu

Przed przejściem do Etapu 7, upewnij się że:

- [ ] Można rozpocząć sesję powtórek (`/review`)
- [ ] Karty są wyświetlane poprawnie (front → back)
- [ ] Oceny są zapisywane (0-3)
- [ ] Harmonogram jest aktualizowany po każdej ocenie
- [ ] Sesja jest zapisywana po zakończeniu
- [ ] Pełny przepływ działa end-to-end
- [ ] Obsługa klawiatury działa

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 7!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Algorytm SM-2 lite

```
Stwórz moduł algorytmu SM-2 lite dla systemu powtórek w aplikacji 10xCards:

Wymagania:
- Plik: src/lib/scheduling.ts
- Funkcja gradeAnswer(input: GradeInput): GradeResult
- Funkcja nextDueAt(intervalDays: number, from?: Date): Date
- Typy: Grade (0|1|2|3), SchedulingState, GradeInput, GradeResult
- Algorytm SM-2 lite:
  - Ease Factor (EF): początkowy 250, zakres 130-400
  - Interval: liczba dni do następnej powtórki
  - Repetitions: liczba udanych powtórek z rzędu
  - Oceny:
    0 (Again): Reset repetitions, zmniejsz EF o 20
    1 (Hard): Reset repetitions, zmniejsz EF o 20
    2 (Good): Zwiększ repetitions, normalny interval
    3 (Easy): Zwiększ repetitions, duży interval, zwiększ EF o 10
  - Interval calculation:
    - repetitions = 1: interval = 1 dzień
    - repetitions = 2: interval = 3 dni
    - repetitions > 2: interval = poprzedni_interval * (ease / 100)

Stack: TypeScript

Upewnij się, że:
- Algorytm jest zgodny z SM-2 lite
- Wszystkie edge cases są obsłużone
- Funkcje są czyste (pure functions)
```

##### Prompt dla Cursor IDE - Komponent ReviewSession

```
Stwórz komponent ReviewSession dla aplikacji 10xCards:

Wymagania:
- Plik: src/components/ReviewSession.tsx
- React component z TypeScript
- Pobieranie kart z /api/review/next (Bearer token)
- UI sesji: pytanie (front) → odpowiedź (back) → ocena
- Przyciski oceny: Again (0), Hard (1), Good (2), Easy (3)
- Obsługa klawiatury: Space (flip), 1/A (Again), 2/H (Hard), 3/G (Good), 4/E (Easy)
- Licznik postępu: odpowiedziano / pozostało
- Zapis oceny do /api/review/submit
- Automatyczny zapis sesji do /api/review/session-complete po zakończeniu
- Loading states i error handling
- Stylizacja z Tailwind CSS

Stack: Astro + React + TypeScript + Supabase + Tailwind CSS

Upewnij się, że:
- Wszystkie operacje używają Bearer token z sesji
- Statystyki sesji są zbierane (cardsReviewed, cardsCorrect)
- Sesja jest zapisywana tylko raz po zakończeniu
- Obsługa klawiatury nie koliduje z innymi elementami
```

##### Troubleshooting

**Problem:** Błąd "Unauthorized" w endpointach review
- **Rozwiązanie:**
  - Sprawdź czy Bearer token jest wysyłany w headerze
  - Sprawdź czy token jest poprawny (session.access_token)
  - Sprawdź czy token nie wygasł

**Problem:** Karty nie są wyświetlane
- **Rozwiązanie:**
  - Sprawdź czy endpoint `/api/review/next` zwraca karty
  - Sprawdź czy są należne karty (due_at <= now)
  - Sprawdź czy użytkownik ma fiszki w bazie

**Problem:** Harmonogram nie jest aktualizowany
- **Rozwiązanie:**
  - Sprawdź czy endpoint `/api/review/submit` jest wywoływany
  - Sprawdź czy algorytm `gradeAnswer` działa poprawnie
  - Sprawdź czy upsert do `card_scheduling` działa

**Problem:** Sesja nie jest zapisywana
- **Rozwiązanie:**
  - Sprawdź czy `sessionStats.cardsReviewed > 0`
  - Sprawdź czy `queue.length === 0`
  - Sprawdź czy `sessionSaved` nie jest już `true`
  - Sprawdź czy endpoint `/api/review/session-complete` działa

**Problem:** Obsługa klawiatury nie działa
- **Rozwiązanie:**
  - Sprawdź czy event listener jest dodany
  - Sprawdź czy `current` jest zdefiniowany
  - Sprawdź czy nie ma konfliktów z innymi event listenerami

---

### Etap 7: Dashboard
**Cel:** Implementacja dashboardu ze statystykami użytkownika

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 6-8 godzin

#### Zadania:

##### Zadanie 7.1: Utility - formatowanie dat

**Kroki:**

1. **Utworzenie modułu dateUtils:**
   
   Utwórz plik `src/lib/dateUtils.ts`:
   
   ```typescript
   /**
    * Formatuje datę po polsku w formacie "DD MMMM YYYY"
    * @param dateString - Data w formacie ISO string lub Date object
    * @returns Sformatowana data po polsku lub null jeśli brak daty
    */
   export function formatDatePL(dateString: string | Date | null | undefined): string | null {
     if (!dateString) return null;
     
     const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
     
     // Sprawdź czy data jest poprawna
     if (isNaN(date.getTime())) return null;
     
     const monthsPL = [
       'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
       'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
     ];
     
     const day = date.getDate();
     const month = monthsPL[date.getMonth()];
     const year = date.getFullYear();
     
     return `${day} ${month} ${year}`;
   }

   /**
    * Zwraca tekst domyślny gdy brak daty
    * @param dateString - Data do sprawdzenia
    * @returns Sformatowana data lub "Jeszcze nie zacząłeś"
    */
   export function formatDateOrDefault(dateString: string | Date | null | undefined): string {
     const formatted = formatDatePL(dateString);
     return formatted || 'Jeszcze nie zacząłeś';
   }
   ```

2. **Weryfikacja:**
   - Sprawdź czy plik się kompiluje
   - Przetestuj funkcję z różnymi datami

**Weryfikacja:**
- [ ] Plik `src/lib/dateUtils.ts` utworzony
- [ ] Funkcja `formatDatePL` działa poprawnie
- [ ] Funkcja `formatDateOrDefault` działa poprawnie
- [ ] Obsługa null/undefined działa

---

##### Zadanie 7.2: Endpoint API - dashboard/stats

**Kroki:**

1. **Utworzenie endpointu:**
   
   Utwórz plik `src/pages/api/dashboard/stats.ts`:
   
   ```typescript
   import type { APIRoute } from 'astro';
   import { createClient } from '@supabase/supabase-js';
   import { formatDatePL } from '../../../lib/dateUtils';

   export const prerender = false;

   function getUserSupabaseClient(request: Request) {
     const supabaseUrl = String(import.meta.env.PUBLIC_SUPABASE_URL || '').trim();
     const supabaseAnonKey = String(import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();
     const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
     const client = createClient(supabaseUrl, supabaseAnonKey, {
       global: { headers: authHeader ? { Authorization: authHeader } : {} }
     });
     return client;
   }

   function getMostUsedTags(allTags: string[][]): string[] {
     const tagCount: Record<string, number> = {};
     
     // Zlicz wszystkie tagi
     for (const tagsArray of allTags) {
       if (Array.isArray(tagsArray)) {
         for (const tag of tagsArray) {
           if (tag && typeof tag === 'string') {
             tagCount[tag] = (tagCount[tag] || 0) + 1;
           }
         }
       }
     }
     
     // Sortuj po liczbie wystąpień (malejąco) i zwróć top 5
     const sortedTags = Object.entries(tagCount)
       .sort(([, countA], [, countB]) => countB - countA)
       .slice(0, 5)
       .map(([tag]) => tag);
     
     return sortedTags;
   }

   export const GET: APIRoute = async ({ request }) => {
     try {
       const client = getUserSupabaseClient(request);
       const userRes = await client.auth.getUser();
       
       if (userRes.error || !userRes.data.user) {
         return new Response(
           JSON.stringify({ error: 'Unauthorized' }),
           { status: 401, headers: { 'Content-Type': 'application/json' } }
         );
       }
       
       const userId = userRes.data.user.id;
       
       // 1. Pobierz liczbę fiszek
       const { count: totalCards, error: countError } = await client
         .from('flashcards')
         .select('*', { count: 'exact', head: true })
         .eq('user_id', userId);
       
       if (countError) {
         console.error('❌ Błąd liczenia fiszek:', countError);
         return new Response(
           JSON.stringify({ error: 'Błąd pobierania statystyk' }),
           { status: 500, headers: { 'Content-Type': 'application/json' } }
         );
       }
       
       // 2. Pobierz ostatnią sesję powtórek
       const { data: lastSession, error: sessionError } = await client
         .from('review_sessions')
         .select('completed_at, accuracy')
         .eq('user_id', userId)
         .order('completed_at', { ascending: false })
         .limit(1)
         .maybeSingle();
       
       if (sessionError) {
         console.error('❌ Błąd pobierania sesji:', sessionError);
       }
       
       const lastReview = lastSession?.completed_at ? formatDatePL(lastSession.completed_at) : null;
       const accuracy = lastSession?.accuracy ? Number(lastSession.accuracy) : 0;
       
       // 3. Pobierz wszystkie tagi z fiszek
       const { data: flashcardsWithTags, error: tagsError } = await client
         .from('flashcards')
         .select('tags')
         .eq('user_id', userId)
         .not('tags', 'is', null);
       
       if (tagsError) {
         console.error('❌ Błąd pobierania tagów:', tagsError);
       }
       
       // Filtruj fiszki które mają niepuste tablice tagów
       const validTagsArrays = (flashcardsWithTags || [])
         .filter(card => card.tags && Array.isArray(card.tags) && card.tags.length > 0)
         .map(card => card.tags as string[]);
       
       const mostUsedTags = getMostUsedTags(validTagsArrays);
       
       // Zwróć statystyki
       return new Response(
         JSON.stringify({
           totalCards: totalCards || 0,
           lastReview: lastReview,
           accuracy: Math.round(accuracy),
           mostUsedTags: mostUsedTags
         }),
         {
           status: 200,
           headers: { 'Content-Type': 'application/json' }
         }
       );
     } catch (error: any) {
       console.error('❌ Dashboard stats error:', error);
       return new Response(
         JSON.stringify({ error: error.message || 'Błąd pobierania statystyk' }),
         {
           status: 500,
           headers: { 'Content-Type': 'application/json' }
         }
       );
     }
   };
   ```

2. **Weryfikacja:**
   - Przetestuj endpoint używając curl lub Postman
   - Sprawdź czy zwraca wszystkie statystyki

**Weryfikacja:**
- [ ] Plik `src/pages/api/dashboard/stats.ts` utworzony
- [ ] Endpoint wymaga autentykacji (Bearer token)
- [ ] Zwraca totalCards, lastReview, accuracy, mostUsedTags
- [ ] Formatowanie dat działa
- [ ] Agregacja tagów działa

---

##### Zadanie 7.3: Strona dashboardu

**Kroki:**

1. **Utworzenie strony dashboardu:**
   
   Utwórz plik `src/pages/dashboard.astro`:
   
   ```astro
   ---
   import '../styles/global.css';
   import DashboardContent from '../components/DashboardContent';
   ---

   <html lang="pl">
     <head>
       <meta charset="utf-8" />
       <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <title>Dashboard - 10xCards</title>
     </head>
     <body>
       <div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-blue-600">
         <div class="max-w-6xl mx-auto">
           <!-- Header -->
           <header class="mb-8 flex items-start justify-between">
             <div>
               <h1 class="text-4xl font-bold text-white mb-2">10xCards</h1>
               <p class="text-white/80">Twoje fiszki w jednym miejscu</p>
             </div>
           </header>

           <!-- Dashboard Content -->
           <DashboardContent client:load />
         </div>
       </div>
     </body>
   </html>
   ```

2. **Weryfikacja:**
   - Otwórz `http://localhost:4321/dashboard`
   - Strona powinna się wyświetlić

**Weryfikacja:**
- [ ] Strona `/dashboard` jest dostępna
- [ ] Strona wymaga logowania (przekierowanie do `/login`)
- [ ] Header wyświetla się poprawnie

---

##### Zadanie 7.4: Komponent DashboardContent

**Kroki:**

1. **Utworzenie komponentu DashboardContent:**
   
   Utwórz plik `src/components/DashboardContent.tsx`:
   
   ```typescript
   import { useEffect, useState } from 'react';
   import { supabase } from '../lib/supabase';
   import DashboardNav from './DashboardNav';

   interface DashboardStats {
     totalCards: number;
     lastReview: string | null;
     accuracy: number;
     mostUsedTags: string[];
   }

   export default function DashboardContent() {
     const [loading, setLoading] = useState(true);
     const [user, setUser] = useState<any>(null);
     const [stats, setStats] = useState<DashboardStats>({
       totalCards: 0,
       lastReview: null,
       accuracy: 0,
       mostUsedTags: []
     });
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
       fetchStats();
     }, []);

     const fetchStats = async () => {
       try {
         setLoading(true);
         setError(null);

         const { data: { session }, error: sessionError } = await supabase.auth.getSession();
         
         if (sessionError || !session) {
           const redirectTo = encodeURIComponent('/dashboard');
           window.location.href = `/login?redirect=${redirectTo}`;
           return;
         }

         setUser(session.user);

         const res = await fetch('/api/dashboard/stats', {
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${session.access_token}`
           }
         });

         if (!res.ok) {
           if (res.status === 401) {
             const redirectTo = encodeURIComponent('/dashboard');
             window.location.href = `/login?redirect=${redirectTo}`;
             return;
           }
           const errorData = await res.json().catch(() => ({}));
           throw new Error(errorData.error || `Błąd HTTP: ${res.status}`);
         }

         const data = await res.json();
         setStats({
           totalCards: data.totalCards || 0,
           lastReview: data.lastReview || null,
           accuracy: data.accuracy || 0,
           mostUsedTags: data.mostUsedTags || []
         });
       } catch (err: any) {
         console.error('❌ Błąd pobierania statystyk:', err);
         setError(err.message || 'Błąd podczas pobierania statystyk');
       } finally {
         setLoading(false);
       }
     };

     if (loading) {
       return (
         <div className="flex items-center justify-center py-12">
           <div className="text-white text-lg">Ładowanie statystyk...</div>
         </div>
       );
     }

     if (error) {
       return (
         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
           <p className="font-semibold">Błąd</p>
           <p className="text-sm">{error}</p>
           <button
             onClick={fetchStats}
             className="mt-2 text-sm underline hover:no-underline"
           >
             Spróbuj ponownie
           </button>
         </div>
       );
     }

     if (!user) return null;

     return (
       <>
         {/* Stats Section */}
         <section className="mb-8">
           <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
             <h2 className="text-2xl font-semibold mb-6 text-gray-800">Twoje statystyki</h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
               {/* Licznik fiszek */}
               <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                 <div className="flex items-center gap-3">
                   <span className="text-3xl">📚</span>
                   <div className="flex-1">
                     <p className="text-sm text-gray-600 font-medium">Masz</p>
                     <p className="text-2xl font-bold text-gray-900">{stats.totalCards}</p>
                     <p className="text-xs text-gray-500">fiszek</p>
                   </div>
                 </div>
               </div>

               {/* Ostatnia powtórka */}
               <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                 <div className="flex items-center gap-3">
                   <span className="text-3xl">📅</span>
                   <div className="flex-1">
                     <p className="text-sm text-gray-600 font-medium">Ostatnia powtórka</p>
                     <p className="text-sm font-bold text-gray-900 break-words">
                       {stats.lastReview || 'Jeszcze nie zacząłeś'}
                     </p>
                     <p className="text-xs text-gray-500"></p>
                   </div>
                 </div>
               </div>

               {/* Poprawność */}
               <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                 <div className="flex items-center gap-3">
                   <span className="text-3xl">🎯</span>
                   <div className="flex-1">
                     <p className="text-sm text-gray-600 font-medium">Poprawność</p>
                     <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
                     <p className="text-xs text-gray-500">w ostatniej sesji</p>
                   </div>
                 </div>
               </div>

               {/* Aktywne tagi */}
               <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                 <div className="flex items-center gap-3">
                   <span className="text-3xl">🏷️</span>
                   <div className="flex-1">
                     <p className="text-sm text-gray-600 font-medium">Aktywne tagi</p>
                     <p className="text-2xl font-bold text-gray-900">{stats.mostUsedTags.length}</p>
                     <p className="text-xs text-gray-500">do nauki</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </section>

         {/* Tags Section */}
         {stats.mostUsedTags.length > 0 && (
           <section className="mb-8">
             <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
               <h2 className="text-2xl font-semibold mb-4 text-gray-800">Najczęstsze tagi</h2>
               <div className="flex flex-wrap gap-2">
                 {stats.mostUsedTags.map((tag) => (
                   <span
                     key={tag}
                     className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                   >
                     {tag}
                   </span>
                 ))}
               </div>
             </div>
           </section>
         )}

         {/* Navigation Buttons */}
         <section>
           <h2 className="text-2xl font-semibold mb-4 text-white">Szybkie akcje</h2>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <DashboardNav
               href="/generate"
               icon="🤖"
               title="Generator AI"
               description="Wygeneruj fiszki za pomocą AI z wklejonego tekstu"
             />
             <DashboardNav
               href="/flashcards"
               icon="📝"
               title="Moje fiszki"
               description="Przeglądaj, edytuj i zarządzaj swoimi fiszkami"
             />
             <DashboardNav
               href="/review"
               icon="🔄"
               title="Rozpocznij powtórkę"
               description="Powtarzaj fiszki i utrwalaj wiedzę"
             />
           </div>
         </section>
       </>
     );
   }
   ```

2. **Weryfikacja:**
   - Otwórz `/dashboard`
   - Sprawdź czy statystyki się wyświetlają
   - Sprawdź czy nawigacja działa

**Weryfikacja:**
- [ ] Komponent `DashboardContent.tsx` utworzony
- [ ] Fetch statystyk działa
- [ ] Statystyki wyświetlają się poprawnie
- [ ] Loading state działa
- [ ] Error handling działa

---

##### Zadanie 7.5: Komponent DashboardNav

**Kroki:**

1. **Utworzenie komponentu DashboardNav:**
   
   Utwórz plik `src/components/DashboardNav.tsx`:
   
   ```typescript
   interface NavButtonProps {
     href: string;
     icon: string;
     title: string;
     description: string;
   }

   export default function DashboardNav({ href, icon, title, description }: NavButtonProps) {
     return (
       <a
         href={href}
         className="group block bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 border-2 border-transparent hover:border-purple-500"
       >
         <div className="p-6 text-center">
           <div className="text-5xl mb-4 transition-transform group-hover:scale-110">
             {icon}
           </div>
           <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
           <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
           <div className="mt-4 inline-flex items-center gap-2 text-purple-600 font-medium group-hover:gap-3 transition-all">
             <span>Przejdź</span>
             <span className="text-xl">→</span>
           </div>
         </div>
       </a>
     );
   }
   ```

2. **Weryfikacja:**
   - Sprawdź czy komponent renderuje się poprawnie
   - Sprawdź czy linki działają

**Weryfikacja:**
- [ ] Komponent `DashboardNav.tsx` utworzony
- [ ] Komponent renderuje się poprawnie
- [ ] Linki działają
- [ ] Hover effects działają

---

#### Weryfikacja etapu

Przed przejściem do Etapu 8, upewnij się że:

- [ ] Dashboard wyświetla statystyki (`/dashboard`)
- [ ] Wszystkie dane są poprawne (totalCards, lastReview, accuracy, mostUsedTags)
- [ ] Daty są sformatowane po polsku
- [ ] UI jest czytelne i responsywne
- [ ] Nawigacja działa (Generator AI, Moje fiszki, Powtórki)
- [ ] Loading states działają
- [ ] Error handling działa

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 8!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Endpoint Dashboard Stats

```
Stwórz endpoint API dla dashboardu w aplikacji 10xCards:

Wymagania:
- Plik: src/pages/api/dashboard/stats.ts
- Metoda: GET
- Autentykacja: Bearer token (Authorization header)
- Zwraca statystyki użytkownika:
  - totalCards: liczba fiszek użytkownika
  - lastReview: data ostatniej sesji powtórek (sformatowana po polsku)
  - accuracy: poprawność z ostatniej sesji (procent)
  - mostUsedTags: top 5 najczęściej używanych tagów
- Agregacja danych z Supabase:
  - flashcards (count)
  - review_sessions (ostatnia sesja)
  - flashcards (tagi)
- Formatowanie dat używając formatDatePL z dateUtils
- Error handling z odpowiednimi kodami HTTP

Stack: Astro + TypeScript + Supabase

Upewnij się, że:
- Wszystkie zapytania używają user_id do filtrowania
- Funkcja getMostUsedTags sortuje tagi po liczbie wystąpień
- Obsługa błędów jest kompletna
```

##### Prompt dla Cursor IDE - Komponent DashboardContent

```
Stwórz komponent DashboardContent dla aplikacji 10xCards:

Wymagania:
- Plik: src/components/DashboardContent.tsx
- React component z TypeScript
- Fetch statystyk z /api/dashboard/stats (Bearer token)
- Wyświetlanie statystyk:
  - Licznik fiszek
  - Ostatnia powtórka
  - Poprawność (accuracy)
  - Aktywne tagi
- Sekcja z najczęstszymi tagami (jeśli są)
- Sekcja z szybkimi akcjami (nawigacja)
- Loading states i error handling
- Stylizacja z Tailwind CSS
- Użycie komponentu DashboardNav dla nawigacji

Stack: Astro + React + TypeScript + Supabase + Tailwind CSS

Upewnij się, że:
- Wszystkie operacje używają Bearer token z sesji
- Redirect do login jeśli brak sesji
- Error handling z możliwością retry
- Responsywny layout (grid)
```

##### Troubleshooting

**Problem:** Błąd "Unauthorized" w endpointzie dashboard/stats
- **Rozwiązanie:**
  - Sprawdź czy Bearer token jest wysyłany w headerze
  - Sprawdź czy token jest poprawny (session.access_token)
  - Sprawdź czy token nie wygasł

**Problem:** Statystyki nie wyświetlają się
- **Rozwiązanie:**
  - Sprawdź czy endpoint zwraca dane
  - Sprawdź czy dane są parsowane poprawnie
  - Sprawdź czy state jest aktualizowany
  - Sprawdź konsolę przeglądarki pod kątem błędów

**Problem:** Daty nie są sformatowane
- **Rozwiązanie:**
  - Sprawdź czy `formatDatePL` jest importowany
  - Sprawdź czy funkcja działa poprawnie
  - Sprawdź czy data nie jest null/undefined

**Problem:** Tagi nie są wyświetlane
- **Rozwiązanie:**
  - Sprawdź czy fiszki mają tagi
  - Sprawdź czy funkcja `getMostUsedTags` działa
  - Sprawdź czy filtrowanie tagów działa poprawnie

**Problem:** Nawigacja nie działa
- **Rozwiązanie:**
  - Sprawdź czy komponent `DashboardNav` jest importowany
  - Sprawdź czy href są poprawne
  - Sprawdź czy linki nie są zablokowane przez event handlers

---

### Etap 8: Testy
**Cel:** Implementacja testów jednostkowych i E2E

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 4-6 godzin

#### Zadania:

##### Zadanie 8.1: Setup Vitest

**Kroki:**

1. **Instalacja Vitest:**
   
   ```bash
   npm install --save-dev vitest @vitest/ui
   ```
   
   **UWAGA:** `@vitest/ui` jest opcjonalne, ale przydatne do interaktywnego UI testów.

2. **Dodanie skryptu test do package.json:**
   
   W `package.json`, dodaj do sekcji `scripts`:
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest"
     }
   }
   ```
   
   **UWAGA:** `vitest run` uruchamia testy raz i kończy (dobre dla CI/CD). `vitest` bez `run` uruchamia tryb watch (dobre dla developmentu).

3. **Konfiguracja Vitest:**
   
   Utwórz plik `vitest.config.ts`:
   ```typescript
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       environment: 'node',
       include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
       reporters: 'default',
     },
   });
   ```

4. **Weryfikacja:**
   - Uruchom `npm test`
   - Powinien się wyświetlić komunikat o braku testów (to normalne na początku)

**Weryfikacja:**
- [ ] Vitest zainstalowany
- [ ] Skrypt `test` dodany do package.json
- [ ] Plik `vitest.config.ts` utworzony
- [ ] `npm test` działa (nawet jeśli brak testów)

---

##### Zadanie 8.2: Test jednostkowy - scheduling.ts

**Kroki:**

1. **Utworzenie pliku testowego:**
   
   Utwórz plik `src/lib/scheduling.test.ts`:
   
   ```typescript
   import { describe, test, expect } from 'vitest';
   import { gradeAnswer, nextDueAt } from './scheduling';

   describe('scheduling', () => {
     describe('gradeAnswer', () => {
       test('again (0) resets repetitions and sets 1 day', () => {
         const result = gradeAnswer({ ease: 250, intervalDays: 10, repetitions: 5, grade: 0 });
         expect(result.nextRepetitions).toBe(0);
         expect(result.nextIntervalDays).toBe(1);
         expect(result.nextEase).toBe(230); // 250 - 20
       });

       test('hard (1) resets repetitions and sets 1 day', () => {
         const result = gradeAnswer({ ease: 250, intervalDays: 10, repetitions: 5, grade: 1 });
         expect(result.nextRepetitions).toBe(0);
         expect(result.nextIntervalDays).toBe(1);
         expect(result.nextEase).toBe(230); // 250 - 20
       });

       test('good (2) increases repetitions and grows interval', () => {
         // Pierwsza powtórka (repetitions = 0)
         const r1 = gradeAnswer({ ease: 250, intervalDays: 0, repetitions: 0, grade: 2 });
         expect(r1.nextRepetitions).toBe(1);
         expect(r1.nextIntervalDays).toBe(1);
         expect(r1.nextEase).toBe(250); // Good nie zmienia ease

         // Druga powtórka (repetitions = 1)
         const r2 = gradeAnswer({
           ease: r1.nextEase,
           intervalDays: r1.nextIntervalDays,
           repetitions: r1.nextRepetitions,
           grade: 2
         });
         expect(r2.nextRepetitions).toBe(2);
         expect(r2.nextIntervalDays).toBe(3);
         expect(r2.nextEase).toBe(250);

         // Trzecia powtórka (repetitions = 2)
         const r3 = gradeAnswer({
           ease: r2.nextEase,
           intervalDays: r2.nextIntervalDays,
           repetitions: r2.nextRepetitions,
           grade: 2
         });
         expect(r3.nextRepetitions).toBe(3);
         expect(r3.nextIntervalDays).toBeGreaterThanOrEqual(3); // interval * (ease / 100)
         expect(r3.nextEase).toBe(250);
       });

       test('easy (3) increases repetitions, large interval, and increases ease', () => {
         const result = gradeAnswer({ ease: 250, intervalDays: 10, repetitions: 5, grade: 3 });
         expect(result.nextRepetitions).toBe(6);
         expect(result.nextIntervalDays).toBeGreaterThanOrEqual(10);
         expect(result.nextEase).toBe(260); // 250 + 10
       });

       test('ease does not drop below 130', () => {
         const result = gradeAnswer({ ease: 130, intervalDays: 5, repetitions: 3, grade: 0 });
         expect(result.nextEase).toBe(130); // Minimum ease
       });

       test('ease can increase above 250', () => {
         const result = gradeAnswer({ ease: 250, intervalDays: 10, repetitions: 5, grade: 3 });
         expect(result.nextEase).toBe(260);
       });
     });

     describe('nextDueAt', () => {
       test('adds days in UTC', () => {
         const base = new Date(Date.UTC(2025, 0, 1)); // 1 stycznia 2025
         const due = nextDueAt(3, base);
         expect(due.toISOString().startsWith('2025-01-04')).toBe(true);
       });

       test('handles zero days', () => {
         const base = new Date(Date.UTC(2025, 0, 1));
         const due = nextDueAt(0, base);
         expect(due.toISOString().startsWith('2025-01-01')).toBe(true);
       });

       test('handles negative days (clamps to 0)', () => {
         const base = new Date(Date.UTC(2025, 0, 1));
         const due = nextDueAt(-5, base);
         expect(due.toISOString().startsWith('2025-01-01')).toBe(true);
       });

       test('uses current date if not provided', () => {
         const before = new Date();
         const due = nextDueAt(1);
         const after = new Date();
         
         // Sprawdź czy data jest między before a after + 1 dzień
         expect(due.getTime()).toBeGreaterThanOrEqual(before.getTime());
         expect(due.getTime()).toBeLessThanOrEqual(after.getTime() + 24 * 60 * 60 * 1000);
       });
     });
   });
   ```

2. **Uruchomienie testów:**
   
   ```bash
   npm test
   ```
   
   Wszystkie testy powinny przejść ✅

3. **Weryfikacja:**
   - Sprawdź czy wszystkie testy przechodzą
   - Sprawdź czy pokrycie jest wystarczające

**Weryfikacja:**
- [ ] Plik `src/lib/scheduling.test.ts` utworzony
- [ ] Testy dla `gradeAnswer` przechodzą (wszystkie scenariusze)
- [ ] Testy dla `nextDueAt` przechodzą (wszystkie scenariusze)
- [ ] `npm test` działa poprawnie

---

##### Zadanie 8.3: Test E2E (opcjonalnie)

**UWAGA:** Testy E2E są opcjonalne dla certyfikacji, ale zalecane dla pełnej jakości aplikacji.

**Kroki:**

1. **Instalacja Playwright:**
   
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   ```

2. **Konfiguracja Playwright:**
   
   Utwórz plik `playwright.config.ts`:
   ```typescript
   import { defineConfig, devices } from '@playwright/test';

   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: 'html',
     use: {
       baseURL: 'http://localhost:4321',
       trace: 'on-first-retry',
     },
     projects: [
       {
         name: 'chromium',
         use: { ...devices['Desktop Chrome'] },
       },
     ],
     webServer: {
       command: 'npm run dev',
       url: 'http://localhost:4321',
       reuseExistingServer: !process.env.CI,
     },
   });
   ```

3. **Utworzenie testu E2E:**
   
   Utwórz katalog `tests/e2e` i plik `tests/e2e/auth-flow.spec.ts`:
   
   ```typescript
   import { test, expect } from '@playwright/test';

   test.describe('Authentication Flow', () => {
     test('user can register and login', async ({ page }) => {
       // Przejdź do strony rejestracji
       await page.goto('/register');
       
       // Wypełnij formularz rejestracji
       await page.fill('input[type="email"]', 'test@example.com');
       await page.fill('input[type="password"]', 'testpassword123');
       await page.click('button[type="submit"]');
       
       // Sprawdź przekierowanie do dashboardu
       await expect(page).toHaveURL(/dashboard/);
       
       // Sprawdź czy użytkownik jest zalogowany
       await expect(page.locator('h1')).toContainText('10xCards');
     });

     test('user can login with existing account', async ({ page }) => {
       // Przejdź do strony logowania
       await page.goto('/login');
       
       // Wypełnij formularz logowania
       await page.fill('input[type="email"]', 'test@example.com');
       await page.fill('input[type="password"]', 'testpassword123');
       await page.click('button[type="submit"]');
       
       // Sprawdź przekierowanie do dashboardu
       await expect(page).toHaveURL(/dashboard/);
     });
   });
   ```

4. **Dodanie skryptu do package.json:**
   
   ```json
   {
     "scripts": {
       "test:e2e": "playwright test",
       "test:e2e:ui": "playwright test --ui"
     }
   }
   ```

5. **Uruchomienie testów E2E:**
   
   ```bash
   npm run test:e2e
   ```

6. **Weryfikacja:**
   - Sprawdź czy testy przechodzą
   - Sprawdź czy aplikacja uruchamia się automatycznie

**Weryfikacja:**
- [ ] Playwright zainstalowany
- [ ] Plik `playwright.config.ts` utworzony
- [ ] Test E2E utworzony
- [ ] `npm run test:e2e` działa
- [ ] Testy E2E przechodzą

---

#### Weryfikacja etapu

Przed przejściem do Etapu 9, upewnij się że:

- [ ] Testy jednostkowe przechodzą (`npm test`)
- [ ] Testy E2E przechodzą (jeśli zaimplementowane)
- [ ] Pokrycie testami jest wystarczające (przynajmniej dla scheduling.ts)
- [ ] Wszystkie testy są stabilne i powtarzalne

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 9!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Setup Vitest

```
Skonfiguruj Vitest dla aplikacji 10xCards:

Wymagania:
- Instalacja: vitest, @vitest/ui (devDependencies)
- Skrypt w package.json: "test": "vitest run"
- Plik konfiguracyjny: vitest.config.ts
- Environment: node
- Include: src/**/*.test.ts, src/**/*.test.tsx
- Reporters: default

Stack: TypeScript + Vitest

Upewnij się, że:
- Konfiguracja jest zgodna z Astro
- Testy mogą być uruchamiane przez npm test
- Tryb watch jest dostępny przez vitest (bez run)
```

##### Prompt dla Cursor IDE - Test jednostkowy scheduling.ts

```
Stwórz testy jednostkowe dla modułu scheduling.ts w aplikacji 10xCards:

Wymagania:
- Plik: src/lib/scheduling.test.ts
- Framework: Vitest (describe, test, expect)
- Testowane funkcje: gradeAnswer, nextDueAt
- Scenariusze:
  - gradeAnswer: again (0), hard (1), good (2), easy (3)
  - gradeAnswer: ease minimum (130), ease increase
  - nextDueAt: dodawanie dni, zero dni, negative days, default date
- Wszystkie edge cases

Stack: TypeScript + Vitest

Upewnij się, że:
- Wszystkie scenariusze są pokryte
- Testy są czytelne i dobrze opisane
- Testy są izolowane (nie zależą od siebie)
```

##### Prompt dla Cursor IDE - Test E2E (opcjonalnie)

```
Skonfiguruj testy E2E z Playwright dla aplikacji 10xCards:

Wymagania:
- Instalacja: @playwright/test
- Plik konfiguracyjny: playwright.config.ts
- Test: tests/e2e/auth-flow.spec.ts
- Scenariusz: rejestracja → login → dashboard
- Base URL: http://localhost:4321
- Web server: automatyczne uruchomienie npm run dev
- Skrypt: "test:e2e": "playwright test"

Stack: TypeScript + Playwright + Astro

Upewnij się, że:
- Playwright automatycznie uruchamia serwer dev
- Testy są stabilne i powtarzalne
- Konfiguracja działa w CI/CD
```

##### Troubleshooting

**Problem:** Błąd "Cannot find module 'vitest'"
- **Rozwiązanie:**
  - Sprawdź czy Vitest jest zainstalowany: `npm list vitest`
  - Zainstaluj ponownie: `npm install --save-dev vitest @vitest/ui`
  - Sprawdź czy node_modules są zsynchronizowane

**Problem:** Testy nie znajdują plików
- **Rozwiązanie:**
  - Sprawdź czy `include` w vitest.config.ts jest poprawne
  - Sprawdź czy pliki testowe mają rozszerzenie `.test.ts`
  - Sprawdź czy ścieżki są względne do katalogu projektu

**Problem:** Testy nie przechodzą
- **Rozwiązanie:**
  - Sprawdź czy funkcje testowane działają poprawnie
  - Sprawdź czy oczekiwania (expect) są poprawne
  - Uruchom testy z verbose: `npm test -- --reporter=verbose`

**Problem:** Playwright nie uruchamia serwera
- **Rozwiązanie:**
  - Sprawdź czy `webServer` w playwright.config.ts jest skonfigurowane
  - Sprawdź czy port 4321 jest wolny
  - Sprawdź czy `reuseExistingServer` jest ustawione poprawnie

**Problem:** Testy E2E są niestabilne
- **Rozwiązanie:**
  - Dodaj `await page.waitForLoadState('networkidle')` przed asercjami
  - Użyj `page.waitForSelector()` zamiast bezpośrednich asercji
  - Zwiększ `timeout` w konfiguracji Playwright

---

### Etap 9: CI/CD
**Cel:** Konfiguracja GitHub Actions dla automatycznych testów

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 2-4 godziny

#### Zadania:

##### Zadanie 9.1: GitHub Actions workflow

**Kroki:**

1. **Utworzenie katalogu workflows:**
   
   Utwórz katalog `.github/workflows` jeśli nie istnieje:
   ```bash
   mkdir -p .github/workflows
   ```

2. **Utworzenie workflow:**
   
   Utwórz plik `.github/workflows/tests.yml`:
   ```yaml
   name: Tests

   on:
     push:
       branches: [ main, master ]
     pull_request:
       branches: [ main, master ]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout code
           uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '22'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Run unit tests
           run: npm test
   ```

3. **Commit i push:**
   
   ```bash
   git add .github/workflows/tests.yml
   git commit -m "ci: add GitHub Actions workflow for tests"
   git push origin main
   ```

4. **Weryfikacja:**
   - Przejdź do GitHub repo
   - Kliknij zakładkę **Actions**
   - Sprawdź czy workflow się uruchomił
   - Sprawdź czy wszystkie kroki przeszły (zielony checkmark ✅)

**Weryfikacja:**
- [ ] Plik `.github/workflows/tests.yml` utworzony
- [ ] Workflow uruchamia się na push/PR
- [ ] Testy przechodzą w CI
- [ ] Status check pokazuje ✅

---

##### Zadanie 9.2: Build check (opcjonalnie)

**Kroki:**

1. **Dodanie build step do workflow:**
   
   Zaktualizuj `.github/workflows/tests.yml`, dodając nowy step po "Run unit tests":
   ```yaml
   - name: Build project
     run: npm run build
   ```

   **UWAGA:** Build może wymagać zmiennych środowiskowych. Możesz je dodać jako secrets w GitHub (Settings → Secrets and variables → Actions), ale dla testów build możesz użyć placeholderów lub pominąć build jeśli wymaga prawdziwych kluczy.

2. **Alternatywnie - build z mockami:**
   
   Jeśli build wymaga zmiennych środowiskowych, możesz je ustawić w workflow:
   ```yaml
   - name: Build project
     run: npm run build
     env:
       PUBLIC_SUPABASE_URL: ${{ secrets.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co' }}
       PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key' }}
       OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY || 'placeholder-key' }}
   ```

3. **Weryfikacja:**
   - Push zmian
   - Sprawdź czy build przechodzi w Actions

**Weryfikacja:**
- [ ] Build step dodany do workflow
- [ ] Build przechodzi w CI
- [ ] Brak błędów kompilacji

---

##### Zadanie 9.3: Linting (opcjonalnie)

**Kroki:**

1. **Instalacja ESLint (jeśli jeszcze nie masz):**
   
   ```bash
   npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
   ```

2. **Konfiguracja ESLint:**
   
   Utwórz plik `.eslintrc.json`:
   ```json
   {
     "parser": "@typescript-eslint/parser",
     "extends": [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended"
     ],
     "plugins": ["@typescript-eslint"],
     "parserOptions": {
       "ecmaVersion": 2022,
       "sourceType": "module"
     },
     "env": {
       "node": true,
       "es2022": true
     },
     "rules": {
       "@typescript-eslint/no-explicit-any": "warn"
     }
   }
   ```

3. **Dodanie skryptu lint do package.json:**
   
   ```json
   {
     "scripts": {
       "lint": "eslint src --ext .ts,.tsx",
       "lint:fix": "eslint src --ext .ts,.tsx --fix"
     }
   }
   ```

4. **Dodanie lint step do workflow:**
   
   Zaktualizuj `.github/workflows/tests.yml`, dodając przed "Run unit tests":
   ```yaml
   - name: Run linter
     run: npm run lint
   ```

5. **Weryfikacja:**
   - Uruchom lokalnie: `npm run lint`
   - Push zmian
   - Sprawdź czy linting przechodzi w CI

**Weryfikacja:**
- [ ] ESLint zainstalowany i skonfigurowany
- [ ] Skrypt `lint` dodany do package.json
- [ ] Lint step dodany do workflow
- [ ] Linting przechodzi w CI

---

#### Weryfikacja etapu

Przed przejściem do Etapu 10, upewnij się że:

- [ ] GitHub Actions uruchamia testy automatycznie
- [ ] Status check pokazuje ✅ po każdym push/PR
- [ ] Wszystkie kroki workflow przechodzą
- [ ] Build check działa (jeśli dodany)
- [ ] Linting działa (jeśli dodany)

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 10!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - GitHub Actions Workflow

```
Stwórz GitHub Actions workflow dla aplikacji 10xCards:

Wymagania:
- Plik: .github/workflows/tests.yml
- Trigger: push i pull_request na main/master
- Job: test
- Steps:
  1. Checkout code (actions/checkout@v4)
  2. Setup Node.js 22 (actions/setup-node@v4 z cache: 'npm')
  3. Install dependencies (npm ci)
  4. Run unit tests (npm test)
- Runner: ubuntu-latest

Stack: GitHub Actions + Node.js 22 + npm

Upewnij się, że:
- Workflow uruchamia się automatycznie na push/PR
- Wszystkie kroki są poprawnie skonfigurowane
- Cache npm jest włączony dla szybszych buildów
```

##### Troubleshooting

**Problem:** Workflow nie uruchamia się
- **Rozwiązanie:**
  - Sprawdź czy plik jest w `.github/workflows/`
  - Sprawdź czy nazwa pliku kończy się na `.yml` lub `.yaml`
  - Sprawdź czy składnia YAML jest poprawna
  - Sprawdź czy branch jest `main` lub `master`

**Problem:** Błąd "npm ci failed"
- **Rozwiązanie:**
  - Sprawdź czy `package-lock.json` jest w repo
  - Sprawdź czy `package-lock.json` jest zsynchronizowany z `package.json`
  - Uruchom lokalnie `npm ci` aby sprawdzić błędy

**Problem:** Testy nie przechodzą w CI
- **Rozwiązanie:**
  - Sprawdź czy testy przechodzą lokalnie
  - Sprawdź czy wszystkie zależności są w `package.json`
  - Sprawdź logi w GitHub Actions dla szczegółów błędu
  - Sprawdź czy Node.js version jest zgodny (22)

**Problem:** Build nie przechodzi w CI
- **Rozwiązanie:**
  - Sprawdź czy build przechodzi lokalnie
  - Sprawdź czy zmienne środowiskowe są ustawione (jeśli wymagane)
  - Sprawdź czy wszystkie zależności są zainstalowane
  - Sprawdź logi w GitHub Actions dla szczegółów błędu

**Problem:** Linting nie przechodzi w CI
- **Rozwiązanie:**
  - Sprawdź czy linting przechodzi lokalnie: `npm run lint`
  - Napraw błędy lokalnie: `npm run lint:fix`
  - Sprawdź czy `.eslintrc.json` jest poprawny
  - Sprawdź czy wszystkie zależności ESLint są zainstalowane

---

### Etap 10: Deployment
**Cel:** Wdrożenie aplikacji na produkcję (Cloudflare Pages)

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 3-5 godzin

#### Zadania:

##### Zadanie 10.1: Konto Cloudflare Pages

**Kroki:**

1. **Utworzenie konta Cloudflare:**
   - Przejdź na [pages.cloudflare.com](https://pages.cloudflare.com)
   - Zaloguj się lub utwórz darmowe konto
   - **UWAGA:** Cloudflare Pages jest darmowe dla projektów open-source i hobby

2. **Połączenie z GitHub:**
   - W Cloudflare Dashboard, przejdź do **Workers & Pages**
   - Kliknij **Create** → **Pages** → **Connect to Git**
   - Wybierz **GitHub** i autoryzuj dostęp
   - Wybierz repozytorium z projektem 10xCards

3. **Weryfikacja:**
   - Sprawdź czy masz dostęp do dashboardu Cloudflare Pages
   - Sprawdź czy repozytorium jest połączone

**Weryfikacja:**
- [ ] Konto Cloudflare utworzone
- [ ] Repozytorium GitHub połączone
- [ ] Dostęp do dashboardu Cloudflare Pages

---

##### Zadanie 10.2: Konfiguracja build

**Kroki:**

1. **Ustawienia build w Cloudflare Pages:**
   
   W konfiguracji projektu, ustaw:
   - **Framework preset:** Astro (lub None jeśli nie ma)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (lub pozostaw puste)
   - **Node version:** `22`

2. **Weryfikacja konfiguracji Astro:**
   
   Sprawdź czy `astro.config.mjs` ma:
   ```javascript
   import cloudflare from '@astrojs/cloudflare';
   
   export default defineConfig({
     adapter: cloudflare(),
     output: 'server', // SSR dla endpointów API
     // ...
   });
   ```

3. **Weryfikacja:**
   - Sprawdź czy build settings są poprawne
   - Sprawdź czy adapter Cloudflare jest zainstalowany: `npm list @astrojs/cloudflare`

**Weryfikacja:**
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node version: 22
- [ ] Adapter Cloudflare skonfigurowany w astro.config.mjs

---

##### Zadanie 10.3: Environment Variables

**Kroki:**

1. **Dodanie zmiennych środowiskowych w Cloudflare Pages:**
   
   W Cloudflare Pages Dashboard:
   - Przejdź do **Settings** → **Environment Variables**
   - Dodaj następujące zmienne dla **Production**:
   
   ```
   PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key
   OPENROUTER_API_KEY=sk-or-v1-twoj-klucz
   ```
   
   **UWAGA:** 
   - `PUBLIC_` prefix oznacza, że zmienne są dostępne w client-side
   - `OPENROUTER_API_KEY` NIE ma `PUBLIC_` - to klucz prywatny, używany tylko server-side
   - Wartości pobierz z:
     - Supabase: Dashboard → Settings → API
     - OpenRouter: [openrouter.ai/keys](https://openrouter.ai/keys)

2. **Opcjonalnie - zmienne dla Preview:**
   
   Jeśli chcesz mieć osobne środowisko dla Pull Requests:
   - Przejdź do **Settings** → **Environment Variables** → **Preview**
   - Dodaj te same zmienne (możesz użyć innych wartości dla testów)

3. **Weryfikacja:**
   - Sprawdź czy wszystkie zmienne są ustawione
   - Sprawdź czy wartości są poprawne (bez błędów w nazwach)

**Weryfikacja:**
- [ ] `PUBLIC_SUPABASE_URL` ustawione
- [ ] `PUBLIC_SUPABASE_ANON_KEY` ustawione
- [ ] `OPENROUTER_API_KEY` ustawione
- [ ] Wszystkie wartości są poprawne

---

##### Zadanie 10.4: Konfiguracja Supabase

**Kroki:**

1. **Dodanie URL produkcyjnego do Supabase:**
   
   W Supabase Dashboard:
   - Przejdź do **Authentication** → **URL Configuration**
   - W sekcji **Redirect URLs**, dodaj:
     - `https://twoj-projekt.pages.dev/**`
     - `https://twoj-projekt.pages.dev`
   
   **UWAGA:** Zastąp `twoj-projekt.pages.dev` rzeczywistym URL z Cloudflare Pages (zobaczysz go po pierwszym deployu).

2. **Dodanie Site URL (opcjonalnie):**
   
   W sekcji **Site URL**, możesz ustawić:
   - `https://twoj-projekt.pages.dev`
   
   To jest domyślny URL, do którego Supabase przekieruje po logowaniu.

3. **Weryfikacja:**
   - Sprawdź czy URL jest poprawny (bez błędów w pisowni)
   - Sprawdź czy `/**` jest dodane na końcu (dla wszystkich ścieżek)

**Weryfikacja:**
- [ ] URL produkcyjny dodany do Redirect URLs
- [ ] Site URL ustawiony (opcjonalnie)
- [ ] Konfiguracja zapisana

---

##### Zadanie 10.5: Deploy

**Kroki:**

1. **Pierwszy deploy:**
   
   W Cloudflare Pages Dashboard:
   - Kliknij **Save and Deploy** (lub **Deploy** jeśli już zapisane)
   - Poczekaj na zakończenie builda
   - Sprawdź logi builda pod kątem błędów

2. **Sprawdzenie URL:**
   
   Po zakończeniu builda:
   - Zobaczysz URL aplikacji (np. `twoj-projekt-abc123.pages.dev`)
   - Skopiuj ten URL - będziesz go potrzebować w Zadaniu 10.4 (jeśli jeszcze nie dodałeś)

3. **Weryfikacja podstawowa:**
   - Otwórz URL w przeglądarce
   - Sprawdź czy strona się wyświetla
   - Sprawdź konsolę przeglądarki pod kątem błędów

4. **Aktualizacja Supabase (jeśli potrzebne):**
   
   Jeśli jeszcze nie dodałeś URL do Supabase:
   - Wróć do Zadania 10.4
   - Dodaj rzeczywisty URL z Cloudflare Pages

**Weryfikacja:**
- [ ] Build przeszedł pomyślnie
- [ ] Aplikacja jest dostępna pod publicznym URL
- [ ] Strona główna wyświetla się poprawnie
- [ ] Brak błędów w konsoli przeglądarki

---

##### Zadanie 10.6: Testy produkcji

**Kroki:**

1. **Test autentykacji:**
   - Przejdź do `/register`
   - Zarejestruj nowe konto testowe
   - Sprawdź czy rejestracja działa
   - Wyloguj się i zaloguj ponownie
   - Sprawdź czy logowanie działa

2. **Test CRUD fiszek:**
   - Przejdź do `/flashcards`
   - Dodaj nową fiszkę
   - Sprawdź czy fiszka się zapisała
   - Edytuj fiszkę
   - Sprawdź czy zmiany się zapisały
   - Usuń fiszkę
   - Sprawdź czy fiszka została usunięta

3. **Test generatora AI:**
   - Przejdź do `/generate`
   - Wklej przykładowy tekst
   - Wygeneruj fiszki
   - Sprawdź czy fiszki się wygenerowały
   - Wybierz kilka i zapisz
   - Sprawdź czy zapisały się w bazie

4. **Test systemu powtórek:**
   - Przejdź do `/review`
   - Sprawdź czy karty się wyświetlają
   - Ocenij kilka kart (0, 1, 2, 3)
   - Sprawdź czy oceny się zapisały
   - Sprawdź czy harmonogram jest aktualizowany

5. **Test dashboardu:**
   - Przejdź do `/dashboard`
   - Sprawdź czy statystyki się wyświetlają
   - Sprawdź czy dane są poprawne
   - Sprawdź czy nawigacja działa

6. **Test responsywności:**
   - Otwórz aplikację na telefonie/tablecie
   - Sprawdź czy UI jest czytelne
   - Sprawdź czy wszystkie funkcjonalności działają

7. **Naprawa błędów:**
   - Jeśli znajdziesz błędy, napraw je lokalnie
   - Commit i push zmian
   - Cloudflare automatycznie zredeployuje aplikację

**Weryfikacja:**
- [ ] Autentykacja działa (rejestracja, logowanie, wylogowanie)
- [ ] CRUD fiszek działa (dodawanie, edycja, usuwanie)
- [ ] Generator AI działa (generowanie, zapisywanie)
- [ ] System powtórek działa (sesja, oceny, harmonogram)
- [ ] Dashboard działa (statystyki, nawigacja)
- [ ] Aplikacja jest responsywna
- [ ] Brak błędów w konsoli
- [ ] Wszystkie funkcjonalności działają poprawnie

---

#### Weryfikacja etapu

Przed przejściem do Etapu 11, upewnij się że:

- [ ] Aplikacja jest wdrożona na Cloudflare Pages
- [ ] Wszystkie funkcjonalności działają na produkcji
- [ ] Brak błędów na produkcji
- [ ] Autentykacja działa (Supabase skonfigurowane)
- [ ] Wszystkie zmienne środowiskowe są ustawione
- [ ] Aplikacja jest responsywna

**Jeśli wszystko działa:** ✅ Możesz przejść do Etapu 11!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Deployment na Cloudflare Pages

```
Przygotuj aplikację 10xCards do deploymentu na Cloudflare Pages:

Wymagania:
- Adapter Cloudflare skonfigurowany w astro.config.mjs
- Build command: npm run build
- Output directory: dist
- Node version: 22
- Environment Variables:
  - PUBLIC_SUPABASE_URL
  - PUBLIC_SUPABASE_ANON_KEY
  - OPENROUTER_API_KEY (bez PUBLIC_ - prywatny)
- Konfiguracja Supabase: dodanie URL produkcyjnego do Redirect URLs

Stack: Astro + Cloudflare Pages + Supabase

Upewnij się, że:
- Adapter Cloudflare jest zainstalowany i skonfigurowany
- Wszystkie zmienne środowiskowe są dostępne
- Supabase jest skonfigurowane dla produkcji
```

##### Troubleshooting

**Problem:** Build nie przechodzi w Cloudflare Pages
- **Rozwiązanie:**
  - Sprawdź logi builda w Cloudflare Dashboard
  - Sprawdź czy Node version jest ustawione na 22
  - Sprawdź czy build command jest poprawny: `npm run build`
  - Sprawdź czy wszystkie zależności są w `package.json`
  - Sprawdź czy `package-lock.json` jest w repo

**Problem:** Błąd "Cannot find module '@astrojs/cloudflare'"
- **Rozwiązanie:**
  - Sprawdź czy adapter jest zainstalowany: `npm list @astrojs/cloudflare`
  - Zainstaluj jeśli brakuje: `npm install @astrojs/cloudflare`
  - Sprawdź czy jest w `dependencies` (nie `devDependencies`)

**Problem:** Aplikacja się wyświetla, ale API nie działa
- **Rozwiązanie:**
  - Sprawdź czy `output: 'server'` jest w astro.config.mjs
  - Sprawdź czy adapter Cloudflare jest skonfigurowany
  - Sprawdź czy endpointy API są w `src/pages/api/`
  - Sprawdź logi w Cloudflare Dashboard

**Problem:** Błąd autentykacji na produkcji
- **Rozwiązanie:**
  - Sprawdź czy URL produkcyjny jest dodany do Supabase Redirect URLs
  - Sprawdź czy `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY` są ustawione
  - Sprawdź czy wartości są poprawne (bez błędów w kopiowaniu)
  - Sprawdź czy URL w Supabase ma `/**` na końcu

**Problem:** Generator AI nie działa na produkcji
- **Rozwiązanie:**
  - Sprawdź czy `OPENROUTER_API_KEY` jest ustawione (bez `PUBLIC_`)
  - Sprawdź czy klucz jest poprawny
  - Sprawdź czy masz doładowany budżet w OpenRouter
  - Sprawdź logi w Cloudflare Dashboard

**Problem:** Zmienne środowiskowe nie działają
- **Rozwiązanie:**
  - Sprawdź czy zmienne są ustawione dla **Production** (nie tylko Preview)
  - Sprawdź czy nazwy zmiennych są poprawne (case-sensitive)
  - Sprawdź czy wartości nie mają dodatkowych spacji
  - Zredeployuj aplikację po zmianie zmiennych

**Problem:** Stare wersje są cache'owane
- **Rozwiązanie:**
  - W Cloudflare Dashboard, przejdź do **Settings** → **Builds & deployments**
  - Kliknij **Retry deployment** dla najnowszego builda
  - Lub użyj **Purge cache** w Cloudflare (jeśli dostępne)

---

### Etap 11: Dokumentacja i Finalizacja
**Cel:** Przygotowanie dokumentacji i finalne przygotowanie do certyfikacji

**Status:** ✅ Gotowe do implementacji

**Szacowany czas:** 2-4 godziny

#### Zadania:

##### Zadanie 11.1: README.md

**Kroki:**

1. **Utworzenie/aktualizacja README.md:**
   
   Utwórz plik `README.md` w głównym katalogu projektu z następującymi sekcjami:

   ```markdown
   # 10xCards
   
   Aplikacja do generowania i nauki fiszek edukacyjnych wspomagana przez AI. 
   Zbudowana z Astro, React, Supabase i Tailwind CSS.
   ```

2. **Sekcja: Funkcjonalności**
   
   Opisz wszystkie główne funkcjonalności:
   - 🔐 Autentykacja (rejestracja, logowanie, wylogowanie)
   - 📝 CRUD Fiszek (tworzenie, edycja, usuwanie, wyświetlanie)
   - 🤖 Generator AI (generowanie fiszek z tekstu)
   - 🔁 System Powtórek (spaced repetition z algorytmem SM-2 lite)
   - 📊 Dashboard (statystyki użytkownika)

3. **Sekcja: Uruchomienie lokalne**
   
   Dodaj instrukcje:
   - Wymagania (Node.js 22+, npm, konto Supabase, konto OpenRouter)
   - Kroki instalacji (clone, install, env, dev)
   - Przykład konfiguracji `.env`

4. **Sekcja: Development**
   
   Dodaj informacje o:
   - Testach (`npm test`)
   - Strukturze projektu
   - API Endpoints (z linkiem do API.md)
   - Linkach do ARCHITECTURE.md

5. **Sekcja: Aplikacja produkcyjna**
   
   Dodaj:
   - Link do aplikacji na Cloudflare Pages
   - Informacje o deployment (krótkie, szczegóły w ARCHITECTURE.md)

6. **Sekcja: Bezpieczeństwo**
   
   Opisz:
   - `.env` w `.gitignore`
   - Brak hardcoded kluczy
   - RLS w Supabase
   - Prywatne klucze API (server-side only)

7. **Sekcja: Troubleshooting (opcjonalnie)**
   
   Dodaj najczęstsze problemy i rozwiązania:
   - Aplikacja nie uruchamia się lokalnie
   - Błędy endpointów API
   - Problemy z zmiennymi środowiskowymi
   - Problemy z CSS na produkcji

8. **Sekcja: Dokumentacja**
   
   Dodaj linki do:
   - ARCHITECTURE.md
   - API.md
   - CHANGELOG.md
   - .ai/tech-stack.md

9. **Weryfikacja:**
   - Sprawdź czy wszystkie sekcje są wypełnione
   - Sprawdź czy linki działają
   - Sprawdź czy przykłady kodu są poprawne

**Weryfikacja:**
- [ ] README.md istnieje i jest kompletne
- [ ] Opis projektu jest jasny
- [ ] Tech stack jest wymieniony
- [ ] Instrukcje lokalnego uruchomienia są kompletne
- [ ] Link do aplikacji produkcyjnej jest dodany
- [ ] Wszystkie sekcje są wypełnione

---

##### Zadanie 11.2: Checklist certyfikacji

**Kroki:**

1. **Utworzenie checklist w README.md lub osobnym pliku:**
   
   Dodaj sekcję "Checklist certyfikacji" z następującymi punktami:

   ```markdown
   ## ✅ Checklist Certyfikacji
   
   ### Wymagania certyfikacyjne
   - [ ] ✅ Autentykacja działa poprawnie
   - [ ] ✅ CRUD dla fiszek działa
   - [ ] ✅ Funkcja z LLM (generator) działa
   - [ ] ✅ Funkcja z logiką biznesową (powtórki) działa
   - [ ] ✅ Testy przechodzą
   - [ ] ✅ CI/CD działa
   - [ ] ✅ Aplikacja wdrożona na produkcji
   ```

2. **Testowanie każdego wymagania:**
   
   Przetestuj każdy punkt:
   - **Auth:** Zarejestruj, zaloguj, wyloguj, sprawdź chronione trasy
   - **CRUD:** Dodaj, edytuj, usuń fiszkę, sprawdź filtrowanie
   - **LLM:** Wygeneruj fiszki z tekstu, zapisz je
   - **Logika biznesowa:** Przejdź sesję powtórek, oceń karty, sprawdź harmonogram
   - **Testy:** Uruchom `npm test`, sprawdź czy wszystkie przechodzą
   - **CI/CD:** Sprawdź GitHub Actions, czy workflow przechodzi
   - **Deployment:** Sprawdź aplikację na produkcji, wszystkie funkcjonalności

3. **Oznaczenie spełnionych wymagań:**
   
   Zaznacz każdy punkt jako ✅ po pomyślnym teście.

4. **Weryfikacja:**
   - Sprawdź czy wszystkie wymagania są spełnione
   - Sprawdź czy checklist jest kompletny

**Weryfikacja:**
- [ ] Checklist certyfikacji utworzony
- [ ] Wszystkie wymagania przetestowane
- [ ] Wszystkie wymagania oznaczone jako ✅
- [ ] Checklist jest kompletny

---

##### Zadanie 11.3: Code review i cleanup

**Kroki:**

1. **Usunięcie console.log():**
   
   Przeszukaj cały kod i usuń wszystkie `console.log()`:
   ```bash
   # Wyszukaj wszystkie console.log
   grep -r "console.log" src/
   ```
   
   **UWAGA:** Możesz zostawić `console.error()` dla błędów, ale usuń debug logs.

2. **Sprawdzenie bezpieczeństwa:**
   
   Sprawdź czy:
   - Brak hardcoded kluczy API w kodzie
   - Wszystkie klucze są w zmiennych środowiskowych
   - `.env` jest w `.gitignore`
   - Brak wrażliwych danych w komentarzach
   - RLS jest włączone w Supabase dla wszystkich tabel

3. **Sprawdzenie historii Git:**
   
   Sprawdź czy w historii commitów nie ma wrażliwych danych:
   ```bash
   # Sprawdź czy .env był kiedykolwiek commitowany
   git log --all --full-history -- .env
   
   # Sprawdź czy klucze API są w historii
   git log -p | grep -i "api.*key\|supabase.*key\|openrouter"
   ```
   
   **Jeśli znajdziesz wrażliwe dane:**
   - Usuń je z historii (użyj `git filter-branch` lub `git filter-repo`)
   - Zmień klucze API w Supabase/OpenRouter
   - Zaktualizuj zmienne środowiskowe

4. **Sprawdzenie .gitignore:**
   
   Upewnij się, że `.gitignore` zawiera:
   ```
   .env
   .env.local
   .env.*.local
   node_modules/
   dist/
   .astro/
   .DS_Store
   ```

5. **Sprawdzenie jakości kodu:**
   
   Uruchom linter (jeśli masz):
   ```bash
   npm run lint
   ```
   
   Napraw wszystkie błędy i ostrzeżenia.

6. **Weryfikacja:**
   - Sprawdź czy nie ma console.log() w kodzie produkcyjnym
   - Sprawdź czy wszystkie klucze są bezpieczne
   - Sprawdź czy .gitignore jest kompletny
   - Sprawdź czy kod jest czysty

**Weryfikacja:**
- [ ] Wszystkie console.log() usunięte
- [ ] Brak hardcoded kluczy API
- [ ] .env jest w .gitignore
- [ ] Historia Git jest czysta (brak wrażliwych danych)
- [ ] Kod jest czytelny i zorganizowany
- [ ] Linter przechodzi bez błędów

---

##### Zadanie 11.4: Przygotowanie do zgłoszenia

**Kroki:**

1. **Zbieranie informacji do zgłoszenia:**
   
   Przygotuj następujące informacje:
   - **Link do aplikacji:** URL z Cloudflare Pages (np. `https://twoj-projekt.pages.dev`)
   - **Link do GitHub repo:** URL do repozytorium (np. `https://github.com/username/10xcards`)
   - **Opis projektu:** Krótki opis (2-3 zdania) co robi aplikacja
   - **Tech stack:** Lista technologii użytych w projekcie

2. **Przygotowanie screenshotów (opcjonalnie):**
   
   Zrób screenshoty:
   - Strona główna
   - Dashboard
   - Generator AI (przed i po generowaniu)
   - Sesja powtórek
   - Lista fiszek
   
   **UWAGA:** Screenshoty nie są wymagane, ale mogą pomóc w prezentacji projektu.

3. **Sprawdzenie wszystkich linków:**
   
   Sprawdź czy:
   - Link do aplikacji działa
   - Link do GitHub repo jest poprawny
   - Wszystkie linki w README działają

4. **Finalna weryfikacja:**
   
   Przed zgłoszeniem sprawdź:
   - Czy wszystkie funkcjonalności działają na produkcji
   - Czy testy przechodzą
   - Czy CI/CD działa
   - Czy dokumentacja jest kompletna
   - Czy kod jest czysty

5. **Przygotowanie opisu projektu:**
   
   Napisz krótki opis projektu (2-3 zdania):
   ```
   10xCards to aplikacja do generowania i nauki fiszek edukacyjnych 
   wspomagana przez AI. Użytkownicy mogą ręcznie tworzyć fiszki lub 
   generować je automatycznie z tekstu przy użyciu modeli AI. Aplikacja 
   wykorzystuje algorytm spaced repetition (SM-2 lite) do optymalizacji 
   procesu nauki.
   ```

6. **Weryfikacja:**
   - Sprawdź czy wszystkie informacje są gotowe
   - Sprawdź czy linki działają
   - Sprawdź czy opis projektu jest jasny

**Weryfikacja:**
- [ ] Link do aplikacji jest gotowy
- [ ] Link do GitHub repo jest gotowy
- [ ] Opis projektu jest napisany
- [ ] Screenshoty są gotowe (opcjonalnie)
- [ ] Wszystkie linki działają
- [ ] Wszystko jest gotowe do zgłoszenia

---

#### Weryfikacja etapu

Przed zgłoszeniem certyfikacji, upewnij się że:

- [ ] Dokumentacja jest kompletna (README.md, ARCHITECTURE.md, API.md)
- [ ] Wszystkie wymagania certyfikacyjne są spełnione
- [ ] Kod jest czysty (brak console.log(), brak hardcoded kluczy)
- [ ] Historia Git jest bezpieczna (brak wrażliwych danych)
- [ ] Aplikacja działa na produkcji
- [ ] Testy przechodzą
- [ ] CI/CD działa
- [ ] Wszystkie linki działają
- [ ] Opis projektu jest gotowy

**Jeśli wszystko jest gotowe:** ✅ Możesz zgłosić projekt do certyfikacji!

---

#### Wskazówki implementacyjne

##### Prompt dla Cursor IDE - Dokumentacja i Finalizacja

```
Przygotuj projekt 10xCards do certyfikacji:

1. Utwórz/aktualizuj README.md z:
   - Opisem projektu i funkcjonalności
   - Instrukcjami lokalnego uruchomienia
   - Linkiem do aplikacji produkcyjnej
   - Sekcją bezpieczeństwa
   - Linkami do ARCHITECTURE.md i API.md

2. Utwórz checklist certyfikacji sprawdzający:
   - Autentykację
   - CRUD fiszek
   - Generator AI (LLM)
   - System powtórek (logika biznesowa)
   - Testy
   - CI/CD
   - Deployment

3. Wykonaj code review i cleanup:
   - Usuń wszystkie console.log()
   - Sprawdź bezpieczeństwo (brak hardcoded kluczy)
   - Sprawdź .gitignore
   - Sprawdź historię Git pod kątem wrażliwych danych

4. Przygotuj informacje do zgłoszenia:
   - Link do aplikacji
   - Link do GitHub repo
   - Opis projektu (2-3 zdania)

Stack: Astro + React + Supabase + OpenRouter + Cloudflare Pages
```

##### Troubleshooting

**Problem:** README.md jest zbyt długi
- **Rozwiązanie:**
  - Przenieś szczegółowe informacje do ARCHITECTURE.md i API.md
  - Zostaw w README tylko najważniejsze informacje
  - Dodaj linki do szczegółowej dokumentacji

**Problem:** Nie wiem jak napisać opis projektu
- **Rozwiązanie:**
  - Opisz problem, który rozwiązuje aplikacja
  - Opisz główne funkcjonalności (2-3 najważniejsze)
  - Opisz technologie użyte w projekcie
  - Użyj prostego języka, unikaj żargonu

**Problem:** Znalazłem wrażliwe dane w historii Git
- **Rozwiązanie:**
  - Użyj `git filter-repo` lub `git filter-branch` do usunięcia
  - Zmień klucze API w Supabase/OpenRouter
  - Zaktualizuj zmienne środowiskowe
  - **UWAGA:** To może wymagać force push, upewnij się że wiesz co robisz

**Problem:** Nie wiem jak zrobić screenshoty
- **Rozwiązanie:**
  - Użyj narzędzi systemowych (Snipping Tool na Windows, Screenshot na Mac)
  - Lub użyj rozszerzeń przeglądarki (np. Full Page Screen Capture)
  - Zapisz screenshoty w folderze `docs/screenshots/` (opcjonalnie)
  - Dodaj linki do screenshotów w README.md

**Problem:** Checklist jest niekompletny
- **Rozwiązanie:**
  - Sprawdź wymagania certyfikacji w dokumentacji 10xDevs
  - Upewnij się, że wszystkie wymagania są na liście
  - Przetestuj każdy punkt przed oznaczeniem jako ✅

---

## ✅ Checklist Finalny

### Wymagania certyfikacyjne
- [ ] ✅ Autentykacja działa poprawnie
- [ ] ✅ CRUD dla fiszek działa
- [ ] ✅ Funkcja z LLM (generator) działa
- [ ] ✅ Funkcja z logiką biznesową (powtórki) działa
- [ ] ✅ Testy przechodzą
- [ ] ✅ CI/CD działa
- [ ] ✅ Aplikacja wdrożona na produkcji

### Dokumentacja
- [ ] ✅ README.md gotowy
- [ ] ✅ Instrukcje lokalnego uruchomienia
- [ ] ✅ Link do aplikacji produkcyjnej

### Jakość kodu
- [ ] ✅ Brak console.log() w produkcji
- [ ] ✅ Brak wrażliwych danych w commicie
- [ ] ✅ Kod jest czytelny i zorganizowany

---

## 📚 Dodatkowe Zasoby

### Dokumentacja
- [Astro Documentation](https://docs.astro.build)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)

### Wzorce i przykłady
- [Astro Examples](https://github.com/withastro/astro/tree/main/examples)
- [Supabase Examples](https://github.com/supabase/supabase/tree/master/examples)
- [10xDevs Certification Path](https://github.com/10xdevs/certification-path)

---

## 🚨 Troubleshooting

### Częste problemy

#### Problem: Aplikacja nie uruchamia się lokalnie
**Możliwe przyczyny:**
- Brak pliku `.env` lub nieprawidłowe wartości
- Node.js nie w wersji 22+
- Port 4321 zajęty

**Rozwiązanie:**
1. Sprawdź czy `.env` istnieje i zawiera poprawne wartości
2. Sprawdź wersję Node: `node --version` (powinna być 22+)
3. Sprawdź czy inny port nie jest używany

#### Problem: Błąd "POST ... are not available in static endpoints"
**Przyczyna:** Endpoint API nie ma `export const prerender = false;`

**Rozwiązanie:**
- Dodaj `export const prerender = false;` na początku pliku endpointu API

#### Problem: "Unexpected end of JSON input" przy POST request
**Możliwe przyczyny:**
- Nie wysyłasz `Content-Type: application/json`
- Body nie jest poprawnym JSON

**Rozwiązanie:**
```javascript
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ key: 'value' })
});
```

#### Problem: PUBLIC_* zmienne nie wczytują się z .env
**Rozwiązanie:**
1. Zatrzymaj serwer dev (`Ctrl+C`)
2. Usuń cache: `.astro`, `node_modules/.vite`
3. Uruchom ponownie: `npm run dev`

#### Problem: CSS nie ładuje się na produkcji (Cloudflare Pages)
**Przyczyna:** Konflikt z `assetFileNames` w `astro.config.mjs`

**Rozwiązanie:**
- Upewnij się, że `astro.config.mjs` NIE ma `assetFileNames` dla CSS (tylko dla JS)
- CSS jest obsługiwany automatycznie przez Astro/Tailwind integration

#### Problem: Błędy Tailwind v4 vs @astrojs/tailwind
**Rozwiązanie:**
- Projekt używa Tailwind CSS v3 z `@astrojs/tailwind`
- Nie używaj `@tailwindcss/vite` (to dla v4)

#### Problem: Testy nie przechodzą w CI/CD
**Możliwe przyczyny:**
- Brak synchronizacji `package-lock.json` z `package.json`
- Node.js w CI nie jest wersji 22

**Rozwiązanie:**
1. Zsynchronizuj lockfile: `npm install`
2. Commit i push `package-lock.json`
3. Sprawdź `.github/workflows/tests.yml` - `node-version: '22'`

#### Problem: Build nie przechodzi w Cloudflare Pages
**Rozwiązanie:**
- Sprawdź logi builda w Cloudflare Dashboard
- Sprawdź czy Node version jest ustawione na 22
- Sprawdź czy build command jest poprawny: `npm run build`
- Sprawdź czy wszystkie zależności są w `package.json`
- Sprawdź czy `package-lock.json` jest w repo

#### Problem: Błąd autentykacji na produkcji
**Rozwiązanie:**
- Sprawdź czy URL produkcyjny jest dodany do Supabase Redirect URLs
- Sprawdź czy `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY` są ustawione
- Sprawdź czy wartości są poprawne (bez błędów w kopiowaniu)
- Sprawdź czy URL w Supabase ma `/**` na końcu

#### Problem: Generator AI nie działa na produkcji
**Rozwiązanie:**
- Sprawdź czy `OPENROUTER_API_KEY` jest ustawione (bez `PUBLIC_`)
- Sprawdź czy klucz jest poprawny
- Sprawdź czy masz doładowany budżet w OpenRouter
- Sprawdź logi w Cloudflare Dashboard

---

## 📝 Notatki

Ta sekcja jest przeznaczona na notatki podczas implementacji. Możesz tutaj zapisywać:
- Odkryte problemy i ich rozwiązania
- Przydatne komendy i skróty
- Linki do pomocnych zasobów
- Uwagi do przyszłych ulepszeń

---

## 📊 Podsumowanie Planu

### Statystyki

- **Łączna liczba etapów:** 11
- **Łączna liczba zadań:** 50+
- **Szacowany czas implementacji:** 8-10 tygodni
- **Status:** ✅ GOTOWY DO UŻYCIA

### Struktura planu

**Przegląd** - Cel projektu, wymagania, tech stack, szacowany czas

**Etapy implementacji:**
1. **Etap 1:** Setup i Konfiguracja Projektu (4-6h)
2. **Etap 2:** Baza danych i Supabase (6-8h)
3. **Etap 3:** Autentykacja (4-6h)
4. **Etap 4:** CRUD Fiszek (6-8h)
5. **Etap 5:** Generator AI (4-6h)
6. **Etap 6:** System Powtórek (6-8h)
7. **Etap 7:** Dashboard (4-6h)
8. **Etap 8:** Testy (4-6h)
9. **Etap 9:** CI/CD (2-4h)
10. **Etap 10:** Deployment (3-5h)
11. **Etap 11:** Dokumentacja i Finalizacja (2-4h)

### Kluczowe elementy każdego etapu

Każdy etap zawiera:
- ✅ Szczegółowe zadania z krokami
- ✅ Weryfikację dla każdego zadania
- ✅ Wskazówki implementacyjne
- ✅ Prompty dla Cursor IDE
- ✅ Troubleshooting z rozwiązaniami

### Jak używać tego planu

1. **Z Cursor IDE Agent:**
   - Skopiuj plan do nowego projektu boilerplate
   - Użyj promptów z sekcji "Wskazówki implementacyjne"
   - Wykonuj etapy po kolei, weryfikując każdy krok

2. **Ręcznie:**
   - Przejdź przez każdy etap krok po kroku
   - Zaznaczaj wykonane zadania w checklistach
   - Sprawdzaj weryfikacje przed przejściem do następnego etapu

3. **W zespole:**
   - Podziel etapy między członków zespołu
   - Użyj checklistów do śledzenia postępu
   - Weryfikuj każdy etap przed merge

### Wymagania certyfikacyjne pokryte

Plan w pełni pokrywa wszystkie 7 wymagań certyfikacyjnych:
- ✅ Autentykacja (Etap 3)
- ✅ CRUD (Etap 4)
- ✅ Funkcja z LLM (Etap 5)
- ✅ Logika biznesowa (Etap 6)
- ✅ Testy (Etap 8)
- ✅ CI/CD (Etap 9)
- ✅ Deployment (Etap 10)

### Następne kroki

1. **Przygotowanie:**
   - Przejrzyj cały plan przed rozpoczęciem
   - Przygotuj konta (Supabase, OpenRouter, Cloudflare, GitHub)
   - Upewnij się, że masz Node.js 22+

2. **Rozpoczęcie:**
   - Zacznij od Etapu 1
   - Wykonuj zadania po kolei
   - Weryfikuj każdy krok

3. **Wsparcie:**
   - Użyj sekcji Troubleshooting przy problemach
   - Sprawdź Dodatkowe Zasoby dla dokumentacji
   - Użyj promptów dla Cursor IDE

---

**Ostatnia aktualizacja:** 2025-01-27  
**Status planu:** ✅ GOTOWY DO UŻYCIA  
**Wersja:** 2.0.0  
**Autor:** Plan stworzony dla certyfikacji 10xDevs

