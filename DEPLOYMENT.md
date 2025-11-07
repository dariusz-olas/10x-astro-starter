# Deployment Guide - Cloudflare Pages

Ten dokument zawiera instrukcje dotyczące wdrożenia aplikacji 10xCards na Cloudflare Pages.

## Wymagania

- Konto Cloudflare (darmowe)
- Repozytorium GitHub z kodem aplikacji
- Konto Supabase z utworzonym projektem
- Klucz API OpenRouter

## Krok 1: Konfiguracja Cloudflare Pages

1. **Utworzenie konta Cloudflare:**
   - Przejdź na [pages.cloudflare.com](https://pages.cloudflare.com)
   - Zaloguj się lub utwórz darmowe konto

2. **Połączenie z GitHub:**
   - W Cloudflare Dashboard, przejdź do **Workers & Pages**
   - Kliknij **Create** → **Pages** → **Connect to Git**
   - Wybierz **GitHub** i autoryzuj dostęp
   - Wybierz repozytorium z projektem 10xCards

3. **Konfiguracja build:**
   - **Framework preset:** Astro (lub None jeśli nie ma)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (lub pozostaw puste)
   - **Node version:** `22`

## Krok 2: Zmienne środowiskowe

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

## Krok 3: Konfiguracja Supabase

Po pierwszym deployu, otrzymasz URL aplikacji (np. `twoj-projekt-abc123.pages.dev`).

W Supabase Dashboard:
- Przejdź do **Authentication** → **URL Configuration**
- W sekcji **Redirect URLs**, dodaj:
  - `https://twoj-projekt-abc123.pages.dev/**`
  - `https://twoj-projekt-abc123.pages.dev`
- W sekcji **Site URL**, możesz ustawić:
  - `https://twoj-projekt-abc123.pages.dev`

## Krok 4: Deploy

1. W Cloudflare Pages Dashboard:
   - Kliknij **Save and Deploy** (lub **Deploy** jeśli już zapisane)
   - Poczekaj na zakończenie builda
   - Sprawdź logi builda pod kątem błędów

2. Po zakończeniu builda:
   - Zobaczysz URL aplikacji
   - Skopiuj ten URL i dodaj go do Supabase (jeśli jeszcze nie dodałeś)

## Krok 5: Weryfikacja

Sprawdź czy:
- ✅ Aplikacja jest dostępna pod publicznym URL
- ✅ Strona główna wyświetla się poprawnie
- ✅ Autentykacja działa (rejestracja, logowanie)
- ✅ CRUD fiszek działa
- ✅ Generator AI działa
- ✅ System powtórek działa
- ✅ Dashboard działa
- ✅ Brak błędów w konsoli przeglądarki

## Troubleshooting

### Build nie przechodzi
- Sprawdź logi builda w Cloudflare Dashboard
- Sprawdź czy Node version jest ustawione na 22
- Sprawdź czy build command jest poprawny: `npm run build`
- Sprawdź czy wszystkie zależności są w `package.json`

### Błąd autentykacji
- Sprawdź czy URL produkcyjny jest dodany do Supabase Redirect URLs
- Sprawdź czy `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY` są ustawione
- Sprawdź czy wartości są poprawne (bez błędów w kopiowaniu)
- Sprawdź czy URL w Supabase ma `/**` na końcu

### Generator AI nie działa
- Sprawdź czy `OPENROUTER_API_KEY` jest ustawione (bez `PUBLIC_`)
- Sprawdź czy klucz jest poprawny
- Sprawdź czy masz doładowany budżet w OpenRouter
- Sprawdź logi w Cloudflare Dashboard

### Zmienne środowiskowe nie działają
- Sprawdź czy zmienne są ustawione dla **Production** (nie tylko Preview)
- Sprawdź czy nazwy zmiennych są poprawne (case-sensitive)
- Sprawdź czy wartości nie mają dodatkowych spacji
- Zredeployuj aplikację po zmianie zmiennych

## Automatyczny deploy

Cloudflare Pages automatycznie deployuje aplikację przy każdym pushu do branchy `main` lub `master`.

Aby zredeployować aplikację:
- Wykonaj push do branchy `main` lub `master`
- Lub w Cloudflare Dashboard: **Settings** → **Builds & deployments** → **Retry deployment`

