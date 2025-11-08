# System logowania - Dokumentacja

## Przegląd

Aplikacja 10xCards używa produkcyjnego systemu logowania, który przechwytuje wszystkie zdarzenia aplikacji w formacie JSON z automatyczną rotacją plików i sanityzacją wrażliwych danych.

## Architektura

System logowania składa się z:

1. **Core Logger** (`src/lib/logger.ts`) - Główna klasa loggera z rotacją plików
2. **Server Logger** (`src/lib/logger-server.ts`) - Wrapper dla endpointów API Astro
3. **Client Logger** (`src/lib/logger-client.ts`) - Wrapper dla komponentów React
4. **Logger Utils** (`src/lib/logger-utils.ts`) - Funkcje pomocnicze (sanitization, request ID)
5. **Logging Middleware** (`src/middleware/logging.ts`) - Automatyczne logowanie requestów API

## Struktura plików logów

Logi są zapisywane w katalogu `logs/`:

```
logs/
├── app-2025-11-08.log      # Wszystkie logi z danego dnia
├── app-2025-11-09.log
├── error-2025-11-08.log    # Tylko ERROR i CRITICAL
└── error-2025-11-09.log
```

- **Rotacja dzienna**: Nowy plik każdego dnia
- **Retencja**: Automatyczne usuwanie plików starszych niż 30 dni
- **Format**: JSON Lines (każda linia to osobny obiekt JSON)

## Format logów

Każdy wpis logu jest obiektem JSON z następującymi polami:

```json
{
  "timestamp": "2025-11-08T10:30:45.123Z",
  "level": "ERROR",
  "component": "api/generate-flashcards",
  "requestId": "req-abc123",
  "userId": "user-xyz789",
  "userEmail": "u***@example.com",
  "message": "Failed to generate flashcards",
  "error": {
    "name": "Error",
    "message": "API Error: 500 Internal Server Error",
    "stack": "Error: API Error...\n    at generateFlashcards..."
  },
  "context": {
    "textLength": 1500,
    "apiEndpoint": "https://openrouter.ai/api/v1/chat/completions",
    "responseStatus": 500
  },
  "metadata": {
    "environment": "development",
    "version": "0.0.1"
  }
}
```

## Poziomy logowania

- **DEBUG**: Szczegółowe informacje dla developmentu (tylko w dev mode)
- **INFO**: Normalne operacje (requesty, sukcesy)
- **WARNING**: Potencjalne problemy (timeouty, retry, niekrytyczne błędy)
- **ERROR**: Błędy wymagające uwagi
- **CRITICAL**: Krytyczne błędy wymagające natychmiastowej interwencji

## Włączanie i wyłączanie logowania

### Wyłączenie logowania do plików

Aby wyłączyć logowanie do plików (zachowując tylko console.log), dodaj do `.env`:

```env
LOG_ENABLED=false
```

Po wyłączeniu:
- Logi nie będą zapisywane do plików
- Tylko CRITICAL błędy będą wyświetlane w konsoli
- Wszystkie inne logi będą ignorowane

### Zmiana poziomu logowania

Aby zmienić minimalny poziom logowania, dodaj do `.env`:

```env
# Loguj tylko błędy i krytyczne problemy
LOG_LEVEL=ERROR

# Loguj wszystko (development)
LOG_LEVEL=DEBUG

# Loguj tylko ważne informacje (production)
LOG_LEVEL=INFO
```

**Domyślne wartości:**
- Development: `DEBUG` (lub wartość z `LOG_LEVEL`)
- Production: `INFO` (lub wartość z `LOG_LEVEL`)

### Przykłady konfiguracji

**Minimalne logowanie (tylko błędy):**
```env
LOG_LEVEL=ERROR
```

**Pełne logowanie (development):**
```env
LOG_LEVEL=DEBUG
```

**Wyłączone logowanie do plików:**
```env
LOG_ENABLED=false
```

**Po zmianie zmiennych środowiskowych:**
1. Zatrzymaj serwer dev (`Ctrl+C`)
2. Uruchom ponownie: `npm run dev`
3. Zmiany będą aktywne

## Sanityzacja danych

System automatycznie maskuje wrażliwe dane:

- **Tokeny**: `Bearer ***masked***`
- **Hasła**: `***masked***`
- **API keys**: `sk-or-v1-***masked***`
- **Emails**: `u***@example.com` (pokazuje tylko domenę)
- **URLs z tokenami**: Maskuje query params z tokenami

## Użycie

### Server-side (API endpoints)

```typescript
import { createServerLogger } from "../lib/logger-server";

export const POST: APIRoute = async ({ request, cookies }) => {
  // Pobierz request ID z middleware lub utwórz nowy
  const requestId = request.headers.get("X-Request-ID") || undefined;
  const logger = createServerLogger({
    component: "api/generate-flashcards",
    requestId,
  });

  try {
    // Pobierz sesję użytkownika
    const { data: { session } } = await supabase.auth.getSession();
    
    // Zaktualizuj logger z kontekstem użytkownika
    const userLogger = logger.withContext({
      userId: session.user.id,
      userEmail: session.user.email,
    });

    await userLogger.info("Request received", {
      textLength: requestData.text.length,
    });

    // ... kod ...

    await userLogger.info("Operation successful", {
      result: "success",
    });
  } catch (error) {
    await logger.error("Operation failed", {
      context: "additional info",
    }, error);
    throw error;
  }
};
```

### Client-side (React components)

```typescript
import { createClientLogger } from "../lib/logger-client";
import { useState } from "react";

export default function MyComponent() {
  const [logger] = useState(() => 
    createClientLogger({ component: "MyComponent" })
  );

  const handleAction = async () => {
    try {
      await logger.info("Action started", { action: "generate" });
      // ... kod ...
      await logger.info("Action completed");
    } catch (error) {
      await logger.error("Action failed", {}, error);
    }
  };
}
```

## Integracja z istniejącym kodem

### Automatyczne logowanie requestów API

Middleware automatycznie loguje wszystkie requesty do `/api/*`:
- Start requestu (method, URL, headers)
- Zakończenie requestu (status code, duration)
- Błędy z pełnym stack trace

### Logowanie operacji AI/LLM

Wszystkie operacje w `src/lib/openrouter.ts` są automatycznie logowane:
- Request do OpenRouter API
- Response z API
- Parsowanie JSON
- Błędy z pełnym kontekstem

### Logowanie operacji bazy danych

Wszystkie endpointy API logują:
- Operacje CRUD na fiszkach
- Operacje na harmonogramie powtórek
- Operacje na sesjach powtórek
- Błędy z kontekstem użytkownika

## Analiza logów

### Znajdowanie błędów

```bash
# Wszystkie błędy z dzisiaj
grep '"level":"ERROR"' logs/error-$(date +%Y-%m-%d).log

# Błędy związane z konkretnym requestem
grep 'req-abc123' logs/app-*.log

# Błędy związane z konkretnym użytkownikiem
grep 'user-xyz789' logs/app-*.log
```

### Analiza wydajności

```bash
# Requesty trwające dłużej niż 1 sekunda
grep 'durationMs' logs/app-*.log | jq 'select(.context.durationMs > 1000)'

# Najczęstsze błędy
grep '"level":"ERROR"' logs/error-*.log | jq -r '.message' | sort | uniq -c | sort -rn
```

### Śledzenie przepływu requestu

Każdy request API ma unikalny `requestId`, który jest przekazywany przez wszystkie logi związane z tym requestem:

```bash
# Wszystkie logi dla konkretnego requestu
grep 'req-abc123' logs/app-*.log | jq '.'
```

## Przykłady logów

### Sukces operacji AI/LLM

```json
{
  "timestamp": "2025-11-08T10:30:45.123Z",
  "level": "INFO",
  "component": "lib/openrouter",
  "requestId": "req-abc123",
  "userId": "user-xyz789",
  "userEmail": "u***@example.com",
  "message": "Flashcards generated successfully",
  "context": {
    "count": 12,
    "durationMs": 2345
  },
  "metadata": {
    "environment": "development",
    "version": "0.0.1"
  }
}
```

### Błąd operacji AI/LLM

```json
{
  "timestamp": "2025-11-08T10:30:45.123Z",
  "level": "ERROR",
  "component": "lib/openrouter",
  "requestId": "req-abc123",
  "userId": "user-xyz789",
  "userEmail": "u***@example.com",
  "message": "OpenRouter API request failed",
  "error": {
    "name": "Error",
    "message": "API Error: 500 Internal Server Error",
    "stack": "Error: API Error...\n    at generateFlashcards..."
  },
  "context": {
    "status": 500,
    "statusText": "Internal Server Error",
    "durationMs": 1234,
    "errorData": {}
  },
  "metadata": {
    "environment": "development",
    "version": "0.0.1"
  }
}
```

### Request API

```json
{
  "timestamp": "2025-11-08T10:30:45.123Z",
  "level": "INFO",
  "component": "api/generate-flashcards",
  "requestId": "req-abc123",
  "message": "API request started",
  "context": {
    "method": "POST",
    "url": "/api/generate-flashcards",
    "headers": {
      "authorization": "***masked***",
      "content-type": "application/json"
    }
  }
}
```

## Best Practices

### Kiedy logować

1. **Zawsze loguj błędy** - Każdy `catch` block powinien zawierać logowanie
2. **Loguj ważne operacje** - CRUD, operacje AI/LLM, operacje bazy danych
3. **Loguj zmiany stanu** - Autentykacja, zmiany sesji
4. **Loguj wydajność** - Długie operacje, requesty API

### Czego NIE logować

1. **Nie loguj wrażliwych danych** - System automatycznie je maskuje, ale unikaj logowania haseł, tokenów
2. **Nie loguj zbyt często** - Unikaj logowania w pętlach
3. **Nie loguj w trybie production na poziomie DEBUG** - DEBUG jest tylko dla developmentu

### Kontekst w logach

Zawsze dodawaj kontekst do logów:

```typescript
// Dobrze - z kontekstem
await logger.info("Flashcard added", {
  frontLength: formData.front.length,
  tagsCount: tagsArray.length,
});

// Źle - bez kontekstu
await logger.info("Flashcard added");
```

### Request ID

Zawsze przekazuj `requestId` przez cały przepływ requestu:

```typescript
// W endpoincie API
const logger = createServerLogger({ requestId });

// Przekaż logger do funkcji pomocniczych
const flashcards = await generateFlashcards(text, logger);
```

## Troubleshooting

### Logi nie są tworzone

1. Sprawdź czy katalog `logs/` istnieje i ma uprawnienia do zapisu
2. Sprawdź czy nie ma błędów w konsoli podczas inicjalizacji loggera
3. W development mode logi są również wyświetlane w konsoli

### Brak logów dla niektórych operacji

1. Sprawdź czy używasz odpowiedniego loggera (server vs client)
2. Sprawdź czy poziom logowania nie jest zbyt wysoki (np. DEBUG w production)
3. Sprawdź czy funkcja jest wywoływana (dodaj console.log dla debugowania)

### Logi są zbyt duże

1. System automatycznie usuwa logi starsze niż 30 dni
2. Możesz ręcznie usunąć stare pliki: `rm logs/app-*.log`
3. Rozważ zwiększenie poziomu minimalnego logowania w production

## Konfiguracja

### Zmienne środowiskowe

Logowanie można kontrolować przez zmienne środowiskowe w pliku `.env`:

```env
# Włącz/wyłącz logowanie do plików (domyślnie: włączone)
LOG_ENABLED=true

# Minimalny poziom logowania (domyślnie: DEBUG w dev, INFO w production)
# Dostępne poziomy: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO
```

**Przykłady:**

```env
# Wyłącz logowanie do plików (tylko console)
LOG_ENABLED=false

# Loguj tylko błędy i krytyczne problemy
LOG_LEVEL=ERROR

# Loguj wszystko w development
LOG_LEVEL=DEBUG
```

### Konfiguracja w kodzie

Konfiguracja loggera znajduje się w `src/lib/logger.ts`:

```typescript
const config = {
  logDir: "logs",                    // Katalog z logami
  maxFileSize: 10 * 1024 * 1024,    // 10MB (opcjonalnie)
  retentionDays: 30,                 // Usuwaj logi starsze niż 30 dni
  minLevel: LogLevel.INFO,           // Minimalny poziom logowania (z env lub domyślny)
  environment: "development",        // development/production
  version: "0.0.1",                  // Wersja aplikacji
};
```

### Zarządzanie logami

**Wyczyść wszystkie logi:**
```bash
npm run logs:clear
```

**Wyświetl logi na żywo (tail):**
```bash
# Wszystkie logi
npm run logs:view

# Tylko błędy
npm run logs:error
```

**Ręczne czyszczenie:**
```bash
# WSL2/Linux
rm -rf logs/*.log

# Windows PowerShell
Remove-Item logs\*.log
```

## Dodawanie logowania do nowego kodu

### Nowy endpoint API

1. Importuj `createServerLogger`
2. Utwórz logger z `requestId` i `component`
3. Zaktualizuj logger z kontekstem użytkownika po autentykacji
4. Loguj ważne operacje i błędy

### Nowy komponent React

1. Importuj `createClientLogger`
2. Utwórz logger w `useState` z `component`
3. Zaktualizuj logger z kontekstem użytkownika w `useEffect`
4. Loguj błędy i ważne akcje użytkownika

### Nowa funkcja pomocnicza

1. Dodaj opcjonalny parametr `logger` do funkcji
2. Utwórz domyślny logger jeśli nie jest podany
3. Loguj entry/exit i błędy

## Przykłady użycia w różnych scenariuszach

### Logowanie operacji CRUD

```typescript
// Create
await logger.info("Flashcard created", { cardId: newCard.id });

// Read
await logger.debug("Flashcards fetched", { count: flashcards.length });

// Update
await logger.info("Flashcard updated", { cardId: card.id });

// Delete
await logger.info("Flashcard deleted", { cardId: id });
```

### Logowanie operacji AI/LLM

```typescript
await logger.info("AI request started", {
  model: "openai/gpt-4o-mini",
  textLength: text.length,
});

await logger.info("AI request completed", {
  flashcardsGenerated: flashcards.length,
  durationMs: duration,
});
```

### Logowanie błędów z kontekstem

```typescript
try {
  // ... kod ...
} catch (error) {
  await logger.error("Operation failed", {
    operation: "generateFlashcards",
    inputLength: text.length,
    attempt: retryCount,
  }, error);
  throw error;
}
```

## Weryfikacja działania

Po wdrożeniu systemu logowania, sprawdź:

1. Czy katalog `logs/` jest tworzony automatycznie
2. Czy logi są zapisywane do plików
3. Czy rotacja plików działa (nowy plik każdego dnia)
4. Czy sanityzacja maskuje wrażliwe dane
5. Czy request ID jest przekazywany przez cały przepływ
6. Czy błędy są logowane z pełnym stack trace

## Zarządzanie logami

### Czyszczenie logów

**Przez skrypt npm (zalecane):**
```bash
npm run logs:clear
```

**Przez API endpoint (tylko development):**
```bash
# DELETE request do /api/logs/clear
curl -X DELETE http://localhost:4321/api/logs/clear
```

**Ręcznie:**
```bash
# WSL2/Linux
rm -rf logs/*.log

# Windows PowerShell
Remove-Item logs\*.log
```

### Wyświetlanie logów

**Wyświetl wszystkie logi na żywo:**
```bash
npm run logs:view
```

**Wyświetl tylko błędy na żywo:**
```bash
npm run logs:error
```

**Ręcznie (WSL2/Linux):**
```bash
# Wszystkie logi z dzisiaj
tail -f logs/app-$(date +%Y-%m-%d).log

# Tylko błędy z dzisiaj
tail -f logs/error-$(date +%Y-%m-%d).log

# Wszystkie logi
cat logs/app-*.log | jq '.'

# Tylko błędy
cat logs/error-*.log | jq '.'
```

**Ręcznie (Windows PowerShell):**
```powershell
# Wszystkie logi
Get-Content logs\app-*.log -Wait

# Tylko błędy
Get-Content logs\error-*.log -Wait
```

### Automatyczne czyszczenie

Logi są automatycznie usuwane po 30 dniach (konfiguracja `retentionDays` w `logger.ts`).

## Wsparcie

W razie problemów z systemem logowania:

1. Sprawdź czy logowanie jest włączone: `LOG_ENABLED=true` w `.env`
2. Sprawdź poziom logowania: `LOG_LEVEL` w `.env`
3. Sprawdź logi w konsoli przeglądarki (client-side)
4. Sprawdź logi w terminalu (server-side w dev mode)
5. Sprawdź pliki w katalogu `logs/`
6. Sprawdź czy nie ma błędów podczas inicjalizacji loggera
7. Wyczyść cache jeśli logi nie są tworzone: `npm run clean:cache`

