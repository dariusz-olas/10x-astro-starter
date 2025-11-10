# Testy integracyjne API

Ten katalog zawiera testy integracyjne dla endpointów API aplikacji 10xCards.

## Obecny status

Aktualnie zawiera **przykładową strukturę** testów integracyjnych dla demonstracji.
Pełna implementacja wymaga dodatkowej konfiguracji środowiska testowego.

## Struktura

```
tests/integration/
├── README.md                    # Ten plik
├── api-version.test.ts          # Przykładowy test dla /api/version
└── (przyszłe testy dla innych endpointów)
```

## Przykładowe testy

### `api-version.test.ts`

Pokazuje strukturę testów integracyjnych dla prostego endpointa bez autentykacji.

Zawiera przykłady testów dla:
- Formatu odpowiedzi
- Kodów statusu HTTP
- Nagłówków odpowiedzi
- Obsługi błędów

## Pełna implementacja - Plan

Aby zaimplementować pełne testy integracyjne, należy:

### 1. Setup środowiska testowego

```typescript
// tests/integration/setup.ts
import { preview } from 'astro';

let server;

export async function startTestServer() {
  server = await preview({
    root: process.cwd(),
    server: { port: 4322 } // Osobny port dla testów
  });
}

export async function stopTestServer() {
  await server.stop();
}
```

### 2. Konfiguracja Vitest

```typescript
// vitest.config.integration.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['tests/integration/setup.ts'],
    testTimeout: 30000, // Dłuższy timeout dla testów integracyjnych
  },
});
```

### 3. Mockowanie Supabase

Opcje:
- **Testowa instancja Supabase**: Użyj osobnej instancji Supabase dla testów
- **Supabase Local**: Uruchom Supabase lokalnie dla testów
- **Mocki**: Mockuj Supabase client w testach

### 4. Przykładowy pełny test

```typescript
describe("POST /api/generate-flashcards", () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup: Utworz testowego użytkownika i pobierz token
    authToken = await createTestUserAndGetToken();
  });

  afterAll(async () => {
    // Cleanup: Usuń testowego użytkownika
    await cleanupTestUser();
  });

  test("generates flashcards with valid input", async () => {
    const response = await fetch('http://localhost:4322/api/generate-flashcards', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'TypeScript to typowany nadzbiór JavaScript.'
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('flashcards');
    expect(Array.isArray(data.flashcards)).toBe(true);
    expect(data.flashcards.length).toBeGreaterThan(0);
    expect(data.flashcards[0]).toHaveProperty('front');
    expect(data.flashcards[0]).toHaveProperty('back');
  });

  test("returns 401 without auth token", async () => {
    const response = await fetch('http://localhost:4322/api/generate-flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Test text'
      }),
    });

    expect(response.status).toBe(401);
  });

  test("returns 400 with empty text", async () => {
    const response = await fetch('http://localhost:4322/api/generate-flashcards', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: ''
      }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('pusty');
  });
});
```

## Uruchamianie testów

```bash
# Uruchom wszystkie testy integracyjne
npm run test:integration

# Uruchom konkretny plik
npm run test:integration -- api-version.test.ts

# Uruchom w trybie watch
npm run test:integration -- --watch
```

## Dodawanie nowych testów

1. Utwórz nowy plik w `tests/integration/` z nazwą `api-{endpoint-name}.test.ts`
2. Import potrzebnych narzędzi z vitest
3. Napisz testy używając struktury podobnej do przykładu
4. Pamiętaj o cleanup po testach (usunięcie testowych danych z bazy)

## Best Practices

### 1. Izolacja testów

Każdy test powinien być niezależny - używaj `beforeEach`/`afterEach` do setupu i cleanup:

```typescript
beforeEach(async () => {
  // Utworz czyste środowisko dla testu
});

afterEach(async () => {
  // Wyczyść dane testowe
});
```

### 2. Fixtures

Używaj fixtures dla powtarzalnych danych testowych:

```typescript
// tests/integration/fixtures/users.ts
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'test123'
  }
};
```

### 3. Helper functions

Twórz funkcje pomocnicze dla powtarzalnych operacji:

```typescript
// tests/integration/helpers/auth.ts
export async function getAuthToken(email: string, password: string) {
  // Logika pobierania tokenu
}

export async function createTestUser() {
  // Logika tworzenia testowego użytkownika
}
```

### 4. Testowanie edge cases

Zawsze testuj:
- Poprawne dane wejściowe
- Brak autentykacji
- Niepoprawne dane (400)
- Brak dostępu (403)
- Nieistniejące zasoby (404)
- Błędy serwera (500)

## Różnica między testami e2e a integracyjnymi

### Testy E2E (Playwright)
- Testują całą aplikację od frontendu do backendu
- Symulują prawdziwego użytkownika w przeglądarce
- Wolniejsze, ale testują kompletny flow
- Znajdują się w `tests/e2e/`

### Testy integracyjne (Vitest)
- Testują tylko API endpoints
- Bezpośrednie żądania HTTP do API
- Szybsze niż testy e2e
- Fokus na logice backendowej
- Znajdują się w `tests/integration/`

### Testy jednostkowe (Vitest)
- Testują pojedyncze funkcje/moduły w izolacji
- Najszybsze
- Mocki dla zależności zewnętrznych
- Znajdują się obok testowanych plików (*.test.ts)

## Rekomendacje

1. **Najpierw testy jednostkowe** - Pokryj logikę biznesową testami jednostkowymi
2. **Następnie testy integracyjne** - Przetestuj integrację między modułami
3. **Na końcu testy e2e** - Przetestuj krytyczne ścieżki użytkownika

## Przydatne linki

- [Dokumentacja Vitest](https://vitest.dev/)
- [Dokumentacja Astro - Testing](https://docs.astro.build/en/guides/testing/)
- [OpenAPI Specification](../openapi.yaml) - Specyfikacja API
