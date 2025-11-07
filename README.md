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

Projekt zawiera testy jednostkowe dla modułu `scheduling.ts` (algorytm SM-2 lite):

```bash
npm test
```

Testy są uruchamiane automatycznie w CI/CD przy każdym pushu do branchy `main` lub `master`.

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
