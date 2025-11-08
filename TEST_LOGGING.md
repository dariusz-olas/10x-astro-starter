# Testowanie poprawionego systemu logowania

## Kroki testowe

1. **Upewnij się, że aplikacja działa:**
   ```bash
   # W WSL2
   npm run dev
   ```

2. **Otwórz aplikację w przeglądarce:**
   - Zaloguj się na konto testowe
   - Przejdź do `/generate`
   - Wygeneruj fiszki (wpisz tekst i kliknij "Generuj")

3. **Sprawdź logi:**
   ```bash
   # W WSL2
   npm run logs:view
   # lub
   tail -f logs/app-$(date +%Y-%m-%d).log
   ```

## Co sprawdzić w logach:

✅ **Request ID jest spójny:**
- Wszystkie logi dla jednego requestu powinny mieć ten sam `requestId`
- Middleware i endpoint powinny używać tego samego ID

✅ **Brak duplikacji:**
- Nie powinno być dwóch identycznych logów "Flashcards generated successfully"
- Powinien być tylko jeden log INFO z endpointu

✅ **Brak błędów:**
- W pliku `error-2025-11-08.log` nie powinno być nowych błędów
- Wszystkie requesty powinny kończyć się statusem 200

## Przykładowe poprawne logi:

```json
{"timestamp":"...","level":"INFO","message":"API request started","component":"/api/generate-flashcards","requestId":"req-abc123",...}
{"timestamp":"...","level":"INFO","message":"Flashcard generation request received","component":"api/generate-flashcards","requestId":"req-abc123",...}
{"timestamp":"...","level":"DEBUG","message":"Flashcards parsing completed","component":"api/generate-flashcards","requestId":"req-abc123",...}
{"timestamp":"...","level":"INFO","message":"Flashcards generated successfully","component":"api/generate-flashcards","requestId":"req-abc123",...}
{"timestamp":"...","level":"INFO","message":"API request completed","component":"/api/generate-flashcards","requestId":"req-abc123",...}
```

Wszystkie logi mają ten sam `requestId: "req-abc123"` ✅

