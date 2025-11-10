# Dokumentacja testowania - 10xCards

Kompletny przewodnik po testach w projekcie 10xCards.

## Spis treści

- [Typy testów](#typy-testów)
- [Uruchamianie testów](#uruchamianie-testów)
- [Pokrycie testami](#pokrycie-testami)
- [Struktura projektu](#struktura-projektu)
- [Dokumentacja API](#dokumentacja-api)
- [Dodawanie nowych testów](#dodawanie-nowych-testów)

## Typy testów

### 1. Testy jednostkowe (Unit Tests)

**Narzędzie**: Vitest

**Lokalizacja**: `src/**/*.test.ts`

**Opis**: Testują pojedyncze funkcje i moduły w izolacji.

**Pokrycie**:
- ✅ `src/lib/scheduling.ts` - Algorytm SM-2 dla powtórek rozłożonych
- ✅ `src/lib/dateUtils.ts` - Funkcje do obsługi dat
- ✅ `src/lib/stats-utils.ts` - Funkcje statystyczne
- ✅ `src/lib/openrouter.ts` - Generowanie fiszek z AI

**Liczba testów**: 90 testów

**Przykład**:
```typescript
// src/lib/dateUtils.test.ts
describe("formatDatePL", () => {
  test("formats valid ISO date string correctly", () => {
    const result = formatDatePL("2025-01-15T10:30:00.000Z");
    expect(result).toBe("15 stycznia 2025");
  });
});
```

### 2. Testy integracyjne (Integration Tests)

**Narzędzie**: Vitest

**Lokalizacja**: `tests/integration/`

**Opis**: Testują integrację między modułami oraz API endpoints.

**Status**: ⚠️ Przykładowa implementacja (wymaga pełnego setupu)

**Uwaga**: Aktualnie zawiera szkielet i dokumentację. Pełna implementacja wymaga:
- Konfiguracji środowiska testowego
- Mockowania/setupu Supabase
- Uruchomienia serwera Astro w trybie testowym

**Więcej informacji**: Zobacz `tests/integration/README.md`

### 3. Testy E2E (End-to-End Tests)

**Narzędzie**: Playwright

**Lokalizacja**: `tests/e2e/`

**Opis**: Testują kompletne ścieżki użytkownika w przeglądarce.

**Pokrycie**:
- ✅ Logowanie i autentykacja
- ✅ Flow powtórek kart
- ✅ Przycisk "Więcej kart"
- ✅ Weryfikacja logów
- ✅ System wersjonowania

**Przykład**:
```bash
npm run test:e2e        # Uruchom wszystkie testy e2e
npm run test:e2e:ui     # Uruchom z interfejsem Playwright UI
```

## Uruchamianie testów

### Testy jednostkowe

```bash
# Uruchom wszystkie testy jednostkowe
npm test

# Uruchom testy w trybie watch (automatyczne ponowne uruchamianie)
npm run test:watch

# Uruchom konkretny plik
npm test -- src/lib/dateUtils.test.ts

# Uruchom testy pasujące do wzorca
npm test -- scheduling
```

### Testy E2E

```bash
# Uruchom wszystkie testy e2e
npm run test:e2e

# Uruchom z interfejsem UI
npm run test:e2e:ui

# Uruchom w trybie headed (z widoczną przeglądarką)
npm run test:e2e:headed

# Uruchom w trybie debug
npm run test:e2e:debug

# Uruchom konkretny test
npm run test:e2e -- tests/e2e/user-flow.spec.ts

# Testy specyficzne
npm run test:e2e:logging      # Testy logowania
npm run test:e2e:more-cards   # Testy przycisku więcej kart
npm run test:e2e:review-full  # Pełny flow powtórek
```

### Testy integracyjne (przyszłe)

```bash
# Po pełnej implementacji:
npm run test:integration

# Uruchom konkretny endpoint
npm run test:integration -- api-version.test.ts
```

## Pokrycie testami

### Testy jednostkowe: ✅ Wysokie pokrycie

| Moduł | Liczba testów | Status |
|-------|--------------|--------|
| `scheduling.ts` | 10 | ✅ |
| `dateUtils.ts` | 23 | ✅ |
| `stats-utils.ts` | 40 | ✅ |
| `openrouter.ts` | 17 | ✅ |
| **Razem** | **90** | **✅** |

### Funkcjonalności testowane E2E: ✅ Kluczowe ścieżki

- Autentykacja użytkownika
- Generowanie fiszek
- System powtórek
- Dashboard i statystyki
- Logowanie aplikacji
- System wersjonowania

### API Endpoints: ⚠️ Częściowe

| Endpoint | Dokumentacja | Testy integracyjne |
|----------|-------------|-------------------|
| `GET /api/version` | ✅ | ⚠️ Przykład |
| `POST /api/auth/logout` | ✅ | ❌ |
| `POST /api/generate-flashcards` | ✅ | ❌ |
| `GET /api/review/next` | ✅ | ❌ |
| `POST /api/review/submit` | ✅ | ❌ |
| `POST /api/review/session-complete` | ✅ | ❌ |
| `GET /api/dashboard/stats` | ✅ | ❌ |
| `GET /api/dashboard/tag-stats` | ✅ | ❌ |

**Legenda**:
- ✅ Zaimplementowane
- ⚠️ Częściowo/Przykład
- ❌ Do zaimplementowania

## Struktura projektu

```
10x-astro-starter/
├── src/
│   ├── lib/
│   │   ├── scheduling.ts              # Algorytm SM-2
│   │   ├── scheduling.test.ts         # ✅ 10 testów
│   │   ├── dateUtils.ts               # Funkcje dat
│   │   ├── dateUtils.test.ts          # ✅ 23 testy
│   │   ├── stats-utils.ts             # Funkcje statystyczne
│   │   ├── stats-utils.test.ts        # ✅ 40 testów
│   │   ├── openrouter.ts              # AI flashcards
│   │   └── openrouter.test.ts         # ✅ 17 testów
│   └── pages/
│       └── api/                       # API endpoints
│           ├── version.ts             # ✅ Udokumentowany
│           ├── auth/
│           │   └── logout.ts          # ✅ Udokumentowany
│           ├── generate-flashcards.ts # ✅ Udokumentowany
│           ├── review/
│           │   ├── next.ts            # ✅ Udokumentowany
│           │   ├── submit.ts          # ✅ Udokumentowany
│           │   └── session-complete.ts # ✅ Udokumentowany
│           └── dashboard/
│               ├── stats.ts           # ✅ Udokumentowany
│               └── tag-stats.ts       # ✅ Udokumentowany
├── tests/
│   ├── e2e/                           # ✅ Testy E2E (Playwright)
│   │   ├── logging-and-auth.spec.ts
│   │   ├── user-flow.spec.ts
│   │   ├── review-full-flow.spec.ts
│   │   └── ...
│   └── integration/                   # ⚠️ Przykładowa struktura
│       ├── README.md                  # Pełna dokumentacja
│       └── api-version.test.ts        # Przykładowy test
├── openapi.yaml                       # ✅ Dokumentacja API (OpenAPI 3.0)
├── vitest.config.ts                   # Konfiguracja Vitest
├── playwright.config.ts               # Konfiguracja Playwright
├── TESTING.md                         # Ten plik
└── package.json
```

## Dokumentacja API

### OpenAPI/Swagger

Kompletna dokumentacja API znajduje się w pliku [`openapi.yaml`](./openapi.yaml).

**Zawartość**:
- Wszystkie endpointy API (8 endpoints)
- Schematy request/response
- Przykłady żądań i odpowiedzi
- Opisy autentykacji
- Kody błędów

**Przeglądanie dokumentacji**:

1. **Online Swagger Editor**:
   - Otwórz https://editor.swagger.io/
   - Wklej zawartość `openapi.yaml`

2. **Lokalnie z VS Code**:
   - Zainstaluj rozszerzenie "OpenAPI (Swagger) Editor"
   - Otwórz plik `openapi.yaml`

3. **Swagger UI** (opcjonalnie):
   ```bash
   # Zainstaluj swagger-ui-watcher
   npm install -g swagger-ui-watcher

   # Uruchom
   swagger-ui-watcher openapi.yaml
   ```

### Przykłady użycia API

Zobacz sekcję `examples` w `openapi.yaml` dla przykładów żądań i odpowiedzi dla każdego endpointa.

## Dodawanie nowych testów

### 1. Testy jednostkowe

**Krok 1**: Utwórz plik testowy obok testowanego modułu:
```bash
# Dla pliku src/lib/my-module.ts
touch src/lib/my-module.test.ts
```

**Krok 2**: Napisz testy:
```typescript
import { describe, test, expect } from "vitest";
import { myFunction } from "./my-module";

describe("myFunction", () => {
  test("handles valid input", () => {
    expect(myFunction("input")).toBe("expected");
  });

  test("throws error for invalid input", () => {
    expect(() => myFunction(null)).toThrow();
  });
});
```

**Krok 3**: Uruchom testy:
```bash
npm test -- my-module
```

### 2. Testy E2E

**Krok 1**: Utwórz plik w `tests/e2e/`:
```bash
touch tests/e2e/my-feature.spec.ts
```

**Krok 2**: Napisz test:
```typescript
import { test, expect } from '@playwright/test';

test('my feature works', async ({ page }) => {
  await page.goto('http://localhost:4321');
  await expect(page.locator('h1')).toContainText('Expected text');
});
```

**Krok 3**: Uruchom test:
```bash
npm run test:e2e -- my-feature.spec.ts
```

### 3. Testy integracyjne (przyszłe)

Zobacz dokumentację w `tests/integration/README.md` dla szczegółowych instrukcji.

## Best Practices

### 1. Nazywanie testów

- Używaj opisowych nazw: `test("returns formatted date for valid input")`
- Unikaj skrótów: ❌ `test("fmt dt")` ✅ `test("formats date correctly")`
- Grupuj testy w `describe` blocks

### 2. Struktura testu (AAA Pattern)

```typescript
test("example test", () => {
  // Arrange - przygotowanie danych
  const input = "test";

  // Act - wykonanie akcji
  const result = myFunction(input);

  // Assert - weryfikacja wyniku
  expect(result).toBe("expected");
});
```

### 3. Testowanie edge cases

Zawsze testuj:
- ✅ Poprawne dane (happy path)
- ✅ Niepoprawne dane (błędy)
- ✅ Przypadki brzegowe (null, undefined, puste stringi)
- ✅ Wartości maksymalne/minimalne

### 4. Mocki i fixtures

- Mockuj zależności zewnętrzne (API, baza danych)
- Używaj fixtures dla powtarzalnych danych testowych
- Zobacz przykłady w `src/lib/openrouter.test.ts`

### 5. Cleanup

```typescript
afterEach(() => {
  // Wyczyść dane testowe
  vi.restoreAllMocks();
});
```

## Debugging testów

### Vitest (testy jednostkowe)

```bash
# Uruchom konkretny test w trybie debug
node --inspect-brk ./node_modules/.bin/vitest run my-test.test.ts

# Lub użyj VS Code debuggera z konfiguracją:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal"
}
```

### Playwright (testy E2E)

```bash
# Uruchom w trybie debug
npm run test:e2e:debug

# Lub z UI
npm run test:e2e:ui
```

## CI/CD

### GitHub Actions (przykład)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
```

## Metryki testów

### Wyniki obecne

```
Testy jednostkowe: 90 testów ✅
├─ scheduling: 10 testów
├─ dateUtils: 23 testy
├─ stats-utils: 40 testów
└─ openrouter: 17 testów

Testy E2E: 6+ scenariuszy ✅
Dokumentacja API: 8 endpoints ✅
Testy integracyjne: Szkielet ⚠️
```

### Czas wykonania

- Testy jednostkowe: ~600ms
- Testy E2E: ~30-60s (zależnie od scenariusza)

## Troubleshooting

### Problem: Testy nie uruchamiają się

**Rozwiązanie**:
```bash
# Wyczyść cache i reinstaluj
rm -rf node_modules package-lock.json
npm install
```

### Problem: Testy E2E failują

**Rozwiązanie**:
```bash
# Zainstaluj przeglądarki Playwright
npx playwright install

# Uruchom z visible browser
npm run test:e2e:headed
```

### Problem: Import errors w testach

**Rozwiązanie**:
- Sprawdź ścieżki importów (używaj względnych ścieżek)
- Upewnij się, że plik `vitest.config.ts` jest poprawny

## Przydatne linki

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## Kontakt

W przypadku pytań lub problemów:
- Otwórz issue w repozytorium
- Zobacz dokumentację w `tests/integration/README.md` dla testów API

---

**Ostatnia aktualizacja**: 2025-01-15

**Wersja dokumentacji**: 1.0.0
