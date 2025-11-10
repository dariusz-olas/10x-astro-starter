# Testy Integracyjne

Testy integracyjne API dla aplikacji 10xCards.

## Wymagania

- **Node.js** (wersja zgodna z projektem)
- **Supabase** (lokalny lub zdalny)
- Zmienne środowiskowe w `.env`:
  - `PUBLIC_SUPABASE_URL` - URL Supabase
  - `PUBLIC_SUPABASE_ANON_KEY` - Klucz publiczny Supabase

## Uruchamianie testów

### Automatyczne uruchomienie (zalecane)

Testy automatycznie uruchamiają serwer dev przed testami i zatrzymują go po zakończeniu:

```bash
npm test tests/integration
```

### Ręczne uruchomienie serwera

Jeśli wolisz ręcznie kontrolować serwer:

1. Uruchom serwer dev w osobnym terminalu:
```bash
npm run dev
```

2. Uruchom testy:
```bash
npm test tests/integration
```

## Konfiguracja

### Zmienne środowiskowe

Ustaw zmienne środowiskowe w `.env` lub bezpośrednio:

```bash
# URL API (domyślnie http://localhost:4321)
export TEST_API_URL=http://localhost:4321

# Supabase
export PUBLIC_SUPABASE_URL=http://localhost:54321
export PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Port serwera testowego

Domyślnie testy używają portu `4321`. Możesz zmienić go przez:

```bash
export TEST_API_PORT=4322
```

## Struktura testów

```
tests/integration/
├── setup.ts                   # Konfiguracja i helpery testowe
├── globalSetup.ts             # Automatyczny start/stop serwera
├── README.md                  # Ta dokumentacja
└── api/
    ├── review/
    │   └── submit.test.ts     # Testy /api/review/submit
    └── generate-flashcards.test.ts # Testy /api/generate-flashcards
```

## Pokrycie testów

### Endpointy z testami:
- ✅ `POST /api/review/submit` - 4 testy
- ✅ `POST /api/generate-flashcards` - 3 testy

### Scenariusze testowe:
- Autoryzacja (Bearer token i cookies)
- Walidacja danych wejściowych
- Logika biznesowa (algorytm SM-2, generowanie fiszek AI)
- Błędy i edge cases

## Dodawanie nowych testów

1. Utwórz nowy plik w `tests/integration/api/`:
```typescript
import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { createTestUser, cleanupTestData, testApiUrl } from "../setup";

describe("POST /api/your-endpoint", () => {
  let testUser = null;

  beforeAll(async () => {
    const email = `test-${Date.now()}@example.com`;
    testUser = await createTestUser(email, "password");
  });

  afterAll(async () => {
    if (testUser?.user.id) {
      await cleanupTestData(testUser.user.id);
    }
  });

  test("your test name", async () => {
    const response = await fetch(`${testApiUrl}/api/your-endpoint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${testUser.session.access_token}`,
      },
      body: JSON.stringify({ /* data */ }),
    });

    expect(response.status).toBe(200);
  });
});
```

2. Uruchom testy:
```bash
npm test tests/integration
```

## Troubleshooting

### Serwer nie uruchamia się automatycznie

Sprawdź logi w konsoli. Jeśli problem się powtarza, uruchom serwer ręcznie:
```bash
npm run dev
```

### Błędy autoryzacji (401)

Upewnij się, że:
- Supabase jest uruchomiony
- Zmienne środowiskowe są poprawne
- Klucz `PUBLIC_SUPABASE_ANON_KEY` jest ważny

### Timeouty

Zwiększ timeout w `vitest.config.ts`:
```typescript
testTimeout: 30000, // 30 sekund
```

### Problemy z bazą danych

Upewnij się, że:
- Supabase jest uruchomiony (`supabase start` dla lokalnej instancji)
- RLS (Row Level Security) jest poprawnie skonfigurowany
- Tabele istnieją i mają odpowiednie kolumny

## Więcej informacji

- [Dokumentacja Vitest](https://vitest.dev/)
- [Dokumentacja Supabase](https://supabase.com/docs)
- [Plan implementacji](../../docs/IMPLEMENTATION-PLAN-TESTS-AND-DOCS.md)
