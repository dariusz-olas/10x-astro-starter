# Testy E2E - Dokumentacja

## Przegląd testów

Projekt zawiera cztery zestawy testów E2E:

1. **`user-flow.spec.ts`** - Podstawowy przepływ użytkownika
   - Rejestracja → Logowanie → Dodanie fiszki → Powtórka → Dashboard

2. **`logging-and-auth.spec.ts`** - Testy autoryzacji i logowania
   - Weryfikacja nagłówków Authorization w requestach API
   - Test przycisku "Przejrzyj więcej kart"
   - Test generowania fiszek przez AI
   - Sprawdzanie spójności requestId w nagłówkach odpowiedzi

3. **`logs-verification.spec.ts`** - Weryfikacja logów serwerowych
   - Sprawdzanie czy logi są tworzone poprawnie
   - Weryfikacja spójności requestId w logach
   - Sprawdzanie czy nie ma błędów ERROR
   - Weryfikacja autoryzacji w logach

4. **`review-full-flow.spec.ts`** - Kompleksowy test pełnego przepływu review
   - Rejestracja użytkownika
   - Dodanie fiszki
   - Przejście przez wszystkie oceny (0-3: Again, Hard, Good, Easy)
   - Weryfikacja harmonogramu
   - Weryfikacja zapisu sesji
   - Weryfikacja autoryzacji we wszystkich requestach

## Uruchomienie testów

### Podstawowe komendy

```bash
# Wszystkie testy E2E
npm run test:e2e

# Tylko testy logowania i autoryzacji
npm run test:e2e:logging

# Testy z automatyczną weryfikacją logów
npm run test:e2e:verify

# Kompleksowy test review (pełny przepływ)
npm run test:e2e:review-full

# Automatyczna weryfikacja zmian w review (testy + analiza logów)
npm run test:e2e:verify-review

# Testy z interfejsem graficznym
npm run test:e2e:ui

# Testy w trybie debug
npm run test:e2e:debug
```

### Automatyczna weryfikacja logów

Po wykonaniu testów możesz automatycznie zweryfikować logi:

```bash
# Uruchom testy i zweryfikuj logi
npm run test:e2e:verify

# Lub ręcznie zweryfikuj logi po testach
node scripts/verify-logs-after-tests.js
```

### Automatyczna weryfikacja zmian w review

**Po każdej zmianie w endpointach review (`/api/review/*`), uruchom:**

```bash
npm run test:e2e:verify-review
```

Ten skrypt:
1. Uruchamia kompleksowy test E2E dla pełnego przepływu review
2. Analizuje logi pod kątem błędów RLS, autoryzacji, sesji, błędów 500
3. Sprawdza statusy wszystkich requestów
4. Raportuje szczegółowe wyniki z wskazówkami

**Wynik:** Otrzymujesz kompletny raport czy wszystko działa poprawnie, bez konieczności ręcznego sprawdzania logów czy testowania w przeglądarce.

## Co testują testy logowania?

### `logging-and-auth.spec.ts`

1. **Autoryzacja w requestach API:**
   - Sprawdza czy wszystkie requesty do `/api/review/*` mają nagłówek `Authorization`
   - Sprawdza czy wszystkie requesty do `/api/generate-flashcards` mają nagłówek `Authorization`
   - Weryfikuje statusy odpowiedzi (powinny być 200)

2. **Test przycisku "Przejrzyj więcej kart":**
   - Kliknięcie przycisku
   - Weryfikacja czy request jest autoryzowany
   - Sprawdzenie czy odpowiedź ma status 200

3. **Spójność requestId:**
   - Sprawdza czy wszystkie requesty mają nagłówek `X-Request-ID`
   - Weryfikuje format requestId (`req-xxxxx-xxxxx`)

### `logs-verification.spec.ts`

1. **Weryfikacja logów serwerowych:**
   - Sprawdza czy logi są tworzone w pliku `logs/app-YYYY-MM-DD.log`
   - Parsuje logi JSON i weryfikuje strukturę
   - Sprawdza czy wszystkie logi mają `requestId`

2. **Spójność requestId:**
   - Grupuje logi po `requestId`
   - Sprawdza czy każdy request ma logi "start" i "end"
   - Weryfikuje czy requestId jest spójny w całym przepływie

3. **Brak błędów:**
   - Sprawdza czy nie ma logów z poziomem ERROR
   - Weryfikuje czy wszystkie requesty zakończyły się statusem 200
   - Sprawdza czy requesty do `/api/review/*` mają nagłówek `authorization` w logach

## Wymagania

- Node.js v22+
- Zmienne środowiskowe Supabase skonfigurowane w `.env`
- Serwer dev może być uruchomiony ręcznie lub automatycznie przez Playwright

## Przykładowy output

Po uruchomieniu `npm run test:e2e:verify`:

```
Running 2 tests using 1 worker

  ✓ tests/e2e/logging-and-auth.spec.ts:3:3 › Weryfikacja logowania i autoryzacji › Test autoryzacji i logowania - pełny przepływ (45s)
  ✓ tests/e2e/logs-verification.spec.ts:3:3 › Weryfikacja logów serwerowych › Weryfikacja logów po wykonaniu akcji (12s)

  2 passed (57s)

=== ANALIZA LOGÓW PO TESTACH ===

📊 Statystyki:
   - Całkowita liczba logów: 42
   - Błędy (ERROR): 0
   - Ostrzeżenia (WARNING): 0
   - Requesty API: 15

🔐 Autoryzacja:
   - Requesty do /api/review/*: 5
   ✅ Z nagłówkiem Authorization: 5
   ❌ Bez nagłówka Authorization: 0

📈 Statusy odpowiedzi:
   - Sukces (200): 15
   - Błędy (>=400): 0

🔗 Spójność requestId:
   - Unikalne requestId: 15
   ✅ Wszystkie requesty mają logi start i end

==================================================
✅ Wszystkie testy przeszły pomyślnie!
```

## Troubleshooting

### Testy nie znajdują logów

- Upewnij się, że serwer dev działa (`npm run dev`)
- Sprawdź czy katalog `logs/` istnieje
- Sprawdź czy zmienne środowiskowe są skonfigurowane

### Testy failują z błędami autoryzacji

- Sprawdź czy zmienne środowiskowe Supabase są poprawne
- Sprawdź czy endpointy API obsługują nagłówek Authorization
- Sprawdź logi serwerowe w `logs/app-*.log`

### Testy są zbyt wolne

- Zwiększ timeout w `playwright.config.ts`
- Użyj `npm run test:e2e:headed` aby zobaczyć co się dzieje
- Sprawdź czy serwer dev działa poprawnie

