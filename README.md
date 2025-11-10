# 10xCards

Aplikacja do generowania i nauki fiszek edukacyjnych wspomagana przez AI. Zbudowana z Astro, React, Supabase i Tailwind CSS.

## 🚀 Funkcjonalności

- 🔐 **Autentykacja** - Rejestracja, logowanie i wylogowanie użytkowników
- 📝 **CRUD Fiszek** - Tworzenie, edycja, usuwanie i wyświetlanie fiszek z tagami
- 🤖 **Generator AI** - Automatyczne generowanie fiszek z tekstu przy użyciu modeli AI (OpenRouter)
- 🔁 **System Powtórek** - Spaced repetition z algorytmem SM-2 lite do optymalizacji nauki
- 📊 **Dashboard** - Statystyki użytkownika, ostatnie powtórki, najczęstsze tagi

## 🛠️ Tech Stack

- [Astro](https://astro.build/) v5 - Framework webowy z SSR
- [React](https://react.dev/) v19 - Biblioteka UI dla komponentów interaktywnych
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4 - Utility-first CSS framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service (PostgreSQL, Auth, RLS)
- [OpenRouter](https://openrouter.ai/) - API do modeli AI
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting i deployment
- [Vitest](https://vitest.dev/) - Framework testowy

## 📋 Wymagania

- Node.js v22+ (sprawdź `.nvmrc`)
- npm (dołączony do Node.js)
- Konto Supabase (darmowe)
- Konto OpenRouter z kluczem API

## 🏃 Uruchomienie lokalne

1. **Sklonuj repozytorium:**

```bash
git clone https://github.com/your-username/10xcards.git
cd 10xcards
```

2. **Zainstaluj zależności:**

```bash
npm install
```

3. **Skonfiguruj zmienne środowiskowe:**

Utwórz plik `.env` w głównym katalogu projektu:

```env
PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
PUBLIC_SUPABASE_ANON_KEY=twoj-anon-key
OPENROUTER_API_KEY=sk-or-v1-twoj-klucz
```

**Gdzie znaleźć wartości:**
- Supabase: Dashboard → Settings → API
- OpenRouter: [openrouter.ai/keys](https://openrouter.ai/keys)

4. **Uruchom serwer deweloperski:**

```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:4321`

5. **Uruchom migracje Supabase:**

Zobacz instrukcje w `supabase/migrations/README.md` i `SUPABASE_SETUP.md`

## 📜 Dostępne skrypty

- `npm run dev` - Uruchom serwer deweloperski
- `npm run build` - Zbuduj aplikację dla produkcji
- `npm run preview` - Podgląd zbudowanej aplikacji
- `npm run lint` - Uruchom ESLint
- `npm run lint:fix` - Napraw błędy ESLint
- `npm test` - Uruchom testy jednostkowe
- `npm run test:watch` - Uruchom testy w trybie watch
- `npm run test:e2e` - Uruchom testy E2E
- `npm run test:e2e:ui` - Uruchom testy E2E z interfejsem graficznym
- `npm run test:e2e:headed` - Uruchom testy E2E w trybie headed
- `npm run test:e2e:debug` - Uruchom testy E2E w trybie debug

## 📁 Struktura projektu

```
.
├── src/
│   ├── layouts/          # Astro layouts
│   ├── pages/            # Astro pages
│   │   └── api/          # API endpoints
│   ├── components/       # Komponenty UI (Astro & React)
│   ├── lib/              # Biblioteki i utilities
│   ├── db/               # Klienci Supabase
│   ├── hooks/            # React hooks
│   └── types.ts          # Wspólne typy TypeScript
├── supabase/
│   └── migrations/       # Migracje SQL dla Supabase
├── public/               # Statyczne zasoby
└── .github/
    └── workflows/        # GitHub Actions workflows
```

## 🌐 Aplikacja produkcyjna

Aplikacja jest wdrożona na Cloudflare Pages: **[Dodaj link do aplikacji]**

Szczegółowe instrukcje deploymentu znajdują się w [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🧪 Testy

### Testy jednostkowe

Projekt zawiera testy jednostkowe dla modułu `scheduling.ts` (algorytm SM-2 lite):

```bash
npm test
```

### Testy E2E (End-to-End)

Projekt zawiera testy E2E z perspektywy użytkownika, które weryfikują pełny przepływ:
- Rejestracja → Logowanie → Dodanie fiszki → Powtórka → Dashboard

**Uruchomienie testów E2E:**

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# Uruchom testy weryfikujące logowanie i autoryzację
npm run test:e2e:logging

# Uruchom testy z interfejsem graficznym
npm run test:e2e:ui

# Uruchom testy w trybie headed (z widoczną przeglądarką)
npm run test:e2e:headed

# Uruchom testy w trybie debug
npm run test:e2e:debug
```

**Wymagania dla testów E2E:**
- Zmienne środowiskowe Supabase muszą być skonfigurowane (w `.env` lub jako secrets w CI/CD)
- Serwer deweloperski (`npm run dev`) musi być uruchomiony lub zostanie uruchomiony automatycznie przez Playwright

**Uwaga:** Testy E2E używają prawdziwego Supabase, więc każdy test tworzy unikalnego użytkownika (email z timestampem). Testy są uruchamiane automatycznie w CI/CD, jeśli dostępne są zmienne środowiskowe Supabase (nie blokują builda jeśli brakuje zmiennych).

**Testy weryfikujące logowanie:**
- `tests/e2e/logging-and-auth.spec.ts` - Testuje autoryzację w requestach API i weryfikuje nagłówki Authorization
- `tests/e2e/logs-verification.spec.ts` - Weryfikuje logi serwerowe po wykonaniu akcji (sprawdza requestId, brak błędów, statusy)
- `tests/e2e/review-full-flow.spec.ts` - Kompleksowy test pełnego przepływu review (rejestracja → dodaj fiszkę → wszystkie oceny → weryfikacja)

**Automatyczna weryfikacja zmian:**
Po każdej zmianie w endpointach review (`/api/review/*`), uruchom automatyczną weryfikację:
```bash
npm run test:e2e:verify-review
```
Ten skrypt uruchamia testy E2E, analizuje logi pod kątem błędów RLS/autoryzacji/sesji i raportuje szczegółowe wyniki. Dzięki temu możesz od razu wiedzieć czy poprawki działają, bez ręcznego sprawdzania.

## 🔒 Bezpieczeństwo

- ✅ Wszystkie klucze API są przechowywane w zmiennych środowiskowych
- ✅ `.env` jest w `.gitignore` (nigdy nie commituj kluczy!)
- ✅ Row Level Security (RLS) jest włączone w Supabase dla wszystkich tabel
- ✅ Prywatne klucze API (`OPENROUTER_API_KEY`) są używane tylko server-side
- ✅ Publiczne klucze (`PUBLIC_*`) są bezpieczne do użycia w client-side

## 📚 Dokumentacja

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Instrukcje deploymentu na Cloudflare Pages
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Konfiguracja Supabase
- [supabase/migrations/README.md](./supabase/migrations/README.md) - Instrukcje migracji

## ✅ Checklist Certyfikacji

### Wymagania certyfikacyjne
- [x] ✅ Autentykacja działa poprawnie
- [x] ✅ CRUD dla fiszek działa
- [x] ✅ Funkcja z LLM (generator) działa
- [x] ✅ Funkcja z logiką biznesową (powtórki) działa
- [x] ✅ Testy przechodzą
- [x] ✅ CI/CD działa
- [ ] ⏳ Aplikacja wdrożona na produkcji (wymaga konfiguracji Cloudflare Pages)

### Dokumentacja
- [x] ✅ README.md gotowy
- [x] ✅ Instrukcje lokalnego uruchomienia
- [x] ✅ Link do aplikacji produkcyjnej (do dodania po deployu)

### Jakość kodu
- [x] ✅ Brak console.log() w produkcji (zachowane console.error dla błędów)
- [x] ✅ Brak wrażliwych danych w commicie
- [x] ✅ Kod jest czytelny i zorganizowany

## 🐛 Troubleshooting

### Aplikacja nie uruchamia się lokalnie
- Sprawdź czy plik `.env` istnieje i zawiera poprawne wartości
- Sprawdź wersję Node.js: `node --version` (powinna być 22+)
- Sprawdź czy port 4321 nie jest zajęty

### Windows ARM64 Compatibility
Jeśli używasz Windows ARM64, lokalne buildy (`npm run build`) mogą nie działać z powodu ograniczeń adaptera Cloudflare. To nie wpływa na buildy produkcyjne na Cloudflare Pages (które działają na Linux). Konfiguracja jest poprawna i będzie działać w produkcji.

Dla lokalnego developmentu na Windows ARM64 możesz:
- Użyć WSL2 (Windows Subsystem for Linux)
- Testować buildy bezpośrednio na Cloudflare Pages przez integrację GitHub
- Kontynuować development z `npm run dev` (które powinno działać)

### Development w WSL2

Jeśli używasz WSL2 do lokalnego developmentu, pamiętaj o następujących kwestiach:

**Cache i pliki tymczasowe:**
- Cache Astro (`.astro/`) i Vite (`node_modules/.vite/`) są tworzone w systemie plików WSL2
- Logi aplikacji (`logs/`) są również tworzone w WSL2
- Jeśli widzisz błędy kompilacji lub stare wersje kodu, wyczyść cache:

```bash
# W terminalu WSL2
npm run clean:cache
# lub ręcznie:
rm -rf .astro node_modules/.vite dist
```

**Ścieżki plików:**
- W WSL2 ścieżki Windows są dostępne przez `/mnt/c/...`
- Kod używa względnych ścieżek (`logs/`, `src/`), więc działa w obu środowiskach
- Komunikaty błędów mogą pokazywać ścieżki WSL2 (`/mnt/c/...`) zamiast Windows (`C:\...`)

**Synchronizacja między środowiskami:**
- Pliki są współdzielone między Windows i WSL2 (ten sam system plików)
- Cache i `node_modules` mogą być różne - zawsze używaj tego samego środowiska
- Zalecane: używaj WSL2 **lub** Windows, nie mieszaj

**Najlepsze praktyki:**
- Zawsze używaj tego samego środowiska (WSL2 lub Windows) w jednej sesji
- Po zmianie środowiska, wyczyść cache: `npm run clean:cache`
- Jeśli widzisz błędy "Cannot access before initialization" lub podobne, wyczyść cache

### Zarządzanie logami

**Wyczyść wszystkie logi:**
```bash
npm run logs:clear
```

**Wyświetl logi na żywo:**
```bash
# Wszystkie logi
npm run logs:view

# Tylko błędy
npm run logs:error
```

**Kontrola logowania przez zmienne środowiskowe:**

Dodaj do pliku `.env`:
```env
# Wyłącz logowanie do plików (tylko console)
LOG_ENABLED=false

# Zmień minimalny poziom logowania (DEBUG, INFO, WARNING, ERROR, CRITICAL)
LOG_LEVEL=INFO
```

Więcej informacji o logowaniu znajduje się w [LOGGING.md](./LOGGING.md)

### Błędy endpointów API
- Sprawdź czy endpoint ma `export const prerender = false;`
- Sprawdź czy używasz poprawnego Content-Type (`application/json`)
- Sprawdź logi w konsoli przeglądarki i Cloudflare Dashboard

### Zmienne środowiskowe nie działają
- Zatrzymaj serwer dev (`Ctrl+C`)
- Usuń cache: `.astro`, `node_modules/.vite`
- Uruchom ponownie: `npm run dev`

Więcej informacji o troubleshooting znajduje się w [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📄 License

MIT
