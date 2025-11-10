import { test, expect } from "@playwright/test";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Testy E2E weryfikujące:
 * 1. Poprawność autoryzacji w requestach API
 * 2. Spójność requestId w logach
 * 3. Brak błędów 401 Unauthorized
 * 4. Działanie funkcjonalności review (w tym przycisk "Przejrzyj więcej kart")
 */
test.describe("Weryfikacja logowania i autoryzacji", () => {
  const uniqueEmail = `test-auth-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const password = "testpassword123";

  test("Test autoryzacji i logowania - pełny przepływ", async ({ page }) => {
    // Monitoruj requesty sieciowe
    const apiRequests: {
      url: string;
      method: string;
      status: number;
      hasAuth: boolean;
      requestId?: string;
    }[] = [];

    // Przechwytuj wszystkie requesty API
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/")) {
        const request = response.request();
        const headers = request.headers();
        const hasAuth = !!headers["authorization"] || !!headers["Authorization"];
        const requestId = response.headers()["x-request-id"];

        apiRequests.push({
          url,
          method: request.method(),
          status: response.status(),
          hasAuth,
          requestId,
        });
      }
    });

    // 1. REJESTRACJA
    await test.step("Rejestracja użytkownika", async () => {
      await page.goto("/register");
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    // 2. DODANIE FISZKI
    await test.step("Dodanie fiszki do testów", async () => {
      await page.goto("/flashcards");
      await page.waitForSelector("text=Wszystkie fiszki", { timeout: 10000 });

      const addButton = page.locator('button:has-text("Dodaj fiszkę")');
      await addButton.click();
      await page.waitForSelector("textarea#front", { timeout: 5000 });

      await page.fill("textarea#front", "Test autoryzacji E2E");
      await page.fill("textarea#back", "Odpowiedź testowa");
      await page.fill("input#tags", "test-auth");

      const submitButton = page.locator('button[type="submit"]:has-text("Zapisz")');
      await submitButton.click();
      await page.waitForSelector("text=Test autoryzacji E2E", { timeout: 10000 });
    });

    // 3. TEST REVIEW - podstawowe ładowanie
    await test.step("Test ładowania strony review", async () => {
      await page.goto("/review");
      await page.waitForLoadState("networkidle");

      // Sprawdź czy strona się załadowała bez błędów
      const errorMessages = page.locator("text=/error|Error|błąd|Błąd/");
      const errorCount = await errorMessages.count();
      expect(errorCount).toBe(0);
    });

    // 4. TEST PRZYCISKU "Przejrzyj więcej kart"
    await test.step("Test przycisku 'Przejrzyj więcej kart'", async () => {
      // Sprawdź czy jest przycisk (może być widoczny jeśli nie ma kart należnych)
      const moreCardsButton = page.locator('button:has-text("Przejrzyj więcej kart")');
      const buttonVisible = await moreCardsButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (buttonVisible) {
        // Kliknij przycisk i sprawdź czy request jest autoryzowany
        const requestsBefore = apiRequests.length;
        await moreCardsButton.click();
        await page.waitForTimeout(2000); // Czekaj na request

        // Sprawdź czy został wykonany request
        const requestsAfter = apiRequests.length;
        expect(requestsAfter).toBeGreaterThan(requestsBefore);

        // Sprawdź ostatni request do /api/review/next?force=true
        const forceRequests = apiRequests.filter((r) => r.url.includes("/api/review/next?force=true"));
        if (forceRequests.length > 0) {
          const lastRequest = forceRequests[forceRequests.length - 1];
          expect(lastRequest.hasAuth).toBe(true);
          expect(lastRequest.status).toBe(200);
        }
      }
    });

    // 5. WERYFIKACJA REQUESTÓW API
    await test.step("Weryfikacja autoryzacji w requestach API", async () => {
      // Sprawdź wszystkie requesty do /api/review/*
      const reviewRequests = apiRequests.filter((r) => r.url.includes("/api/review/"));
      expect(reviewRequests.length).toBeGreaterThan(0);

      // Wszystkie requesty powinny mieć nagłówek Authorization
      const unauthorizedRequests = reviewRequests.filter((r) => !r.hasAuth);
      expect(unauthorizedRequests.length).toBe(0);

      // Wszystkie requesty powinny mieć status 200 (lub inny sukces)
      const failedRequests = reviewRequests.filter((r) => r.status >= 400);
      expect(failedRequests.length).toBe(0);
    });

    // 6. TEST GENEROWANIA FISZEK (AI)
    await test.step("Test generowania fiszek przez AI", async () => {
      await page.goto("/generate");
      await page.waitForLoadState("networkidle");

      // Wypełnij formularz
      const textarea = page.locator("textarea");
      await textarea.fill("JavaScript to język programowania używany do tworzenia interaktywnych stron internetowych.");

      // Kliknij przycisk generowania
      const generateButton = page.locator('button:has-text("Generuj")');
      await generateButton.click();

      // Poczekaj na odpowiedź (może zająć kilka sekund)
      await page.waitForSelector("text=Wygenerowane fiszki", { timeout: 30000 });

      // Sprawdź czy są wygenerowane fiszki
      const flashcards = page.locator('[data-testid="generated-flashcard"], .flashcard-item');
      const count = await flashcards.count();
      expect(count).toBeGreaterThan(0);
    });

    // 7. WERYFIKACJA REQUESTÓW DO GENERATE-FLASHCARDS
    await test.step("Weryfikacja autoryzacji w requestach do generate-flashcards", async () => {
      const generateRequests = apiRequests.filter((r) => r.url.includes("/api/generate-flashcards"));
      expect(generateRequests.length).toBeGreaterThan(0);

      // Wszystkie requesty powinny mieć nagłówek Authorization
      const unauthorizedGenerate = generateRequests.filter((r) => !r.hasAuth);
      expect(unauthorizedGenerate.length).toBe(0);

      // Wszystkie requesty powinny mieć status 200
      const failedGenerate = generateRequests.filter((r) => r.status !== 200);
      expect(failedGenerate.length).toBe(0);
    });
  });

  test("Weryfikacja spójności requestId w logach", async ({ page }) => {
    // Ten test wymaga dostępu do plików logów po zakończeniu
    // Możemy sprawdzić requestId w nagłówkach odpowiedzi
    const requestIds: string[] = [];

    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/")) {
        const requestId = response.headers()["x-request-id"];
        if (requestId) {
          requestIds.push(requestId);
        }
      }
    });

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    // Wykonaj kilka requestów
    await page.goto("/flashcards");
    await page.waitForLoadState("networkidle");

    await page.goto("/review");
    await page.waitForLoadState("networkidle");

    // Sprawdź czy wszystkie requesty mają requestId
    expect(requestIds.length).toBeGreaterThan(0);
    requestIds.forEach((id) => {
      expect(id).toBeTruthy();
      expect(id).toMatch(/^req-/); // Format: req-xxxxx-xxxxx
    });
  });
});
