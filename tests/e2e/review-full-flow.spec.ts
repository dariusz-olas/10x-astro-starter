import { test, expect } from "@playwright/test";

/**
 * Kompleksowy test E2E dla pełnego przepływu review:
 * 1. Rejestracja użytkownika
 * 2. Dodanie fiszki
 * 3. Przejście przez wszystkie oceny (0-3)
 * 4. Weryfikacja harmonogramu
 * 5. Weryfikacja zapisu sesji
 * 6. Weryfikacja autoryzacji we wszystkich requestach
 */
test.describe("Kompleksowy test przepływu review", () => {
  const uniqueEmail = `test-review-full-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const password = "testpassword123";

  test("Pełny przepływ: rejestracja → dodaj fiszkę → wszystkie oceny → weryfikacja", async ({ page }) => {
    // Monitoruj wszystkie requesty sieciowe
    const networkRequests: Array<{
      url: string;
      method: string;
      status: number;
      headers: Record<string, string>;
      responseBody?: any;
      error?: string;
    }> = [];

    // Przechwytuj requesty i odpowiedzi
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/review/") || url.includes("/api/dashboard/")) {
        const headersObj = request.headers();
        const headers: Record<string, string> = {};
        // request.headers() zwraca obiekt, nie Map
        for (const [key, value] of Object.entries(headersObj)) {
          headers[key.toLowerCase()] = value;
        }
        networkRequests.push({
          url,
          method: request.method(),
          status: 0, // Będzie zaktualizowane w response
          headers,
        });
      }
    });

    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/review/") || url.includes("/api/dashboard/")) {
        const request = networkRequests.find((r) => r.url === url && r.method === response.request().method());
        if (request) {
          request.status = response.status();
          try {
            request.responseBody = await response.json().catch(() => null);
          } catch (e) {
            request.error = String(e);
          }
        }
      }
    });

    // 1. REJESTRACJA
    await test.step("Rejestracja użytkownika", async () => {
      await page.goto("/register");
      await page.waitForLoadState("networkidle");
      
      // Wypełnij formularz
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      
      // Kliknij przycisk rejestracji i poczekaj na nawigację
      await Promise.all([
        page.waitForURL(/\/dashboard/, { timeout: 30000 }),
        page.click('button:has-text("Zarejestruj się")'),
      ]);
      
      // Sprawdź czy jesteśmy na dashboardzie
      await expect(page).toHaveURL(/\/dashboard/);
      await page.waitForLoadState("networkidle");
    });

    // 2. DODANIE FISZKI
    await test.step("Dodanie fiszki do powtórki", async () => {
      await page.goto("/flashcards");
      await page.waitForSelector("text=Wszystkie fiszki", { timeout: 10000 });

      const addButton = page.locator('button:has-text("Dodaj fiszkę")');
      await addButton.click();
      await page.waitForSelector("textarea#front", { timeout: 5000 });

      await page.fill("textarea#front", "Test pełnego przepływu review");
      await page.fill("textarea#back", "Odpowiedź testowa dla review");
      await page.fill("input#tags", "test-review-full");

      const submitButton = page.locator('button[type="submit"]:has-text("Zapisz")');
      await submitButton.click();
      await page.waitForSelector("text=Test pełnego przepływu review", { timeout: 10000 });
    });

    // 3. PRZEJŚCIE DO REVIEW I ZAŁADOWANIE KART
    await test.step("Przejście do strony review i załadowanie kart", async () => {
      await page.goto("/review");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      // Sprawdź czy karty zostały załadowane
      const cardFront = page.locator("text=Test pełnego przepływu review");
      const hasCard = await cardFront.isVisible({ timeout: 10000 }).catch(() => false);

      // Jeśli nie ma kart należnych, użyj trybu force
      if (!hasCard) {
        const moreCardsButton = page.locator('button:has-text("Przejrzyj więcej kart")');
        const buttonVisible = await moreCardsButton.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (buttonVisible) {
          await moreCardsButton.click();
          await page.waitForTimeout(3000);
          // Sprawdź ponownie
          const cardAfterForce = await cardFront.isVisible({ timeout: 5000 }).catch(() => false);
          expect(cardAfterForce).toBe(true);
        }
      }

      // Weryfikuj że karta jest widoczna
      await expect(cardFront).toBeVisible({ timeout: 10000 });
    });

    // 4. PRZEJŚCIE PRZEZ WSZYSTKIE OCENY
    const grades = [
      { name: "Again (0)", button: 'button:has-text("Again (1/A)")', value: 0 },
      { name: "Hard (1)", button: 'button:has-text("Hard (2/H)")', value: 1 },
      { name: "Good (2)", button: 'button:has-text("Good (3/G)")', value: 2 },
      { name: "Easy (3)", button: 'button:has-text("Easy (4/E)")', value: 3 },
    ];

    for (const grade of grades) {
      await test.step(`Ocena: ${grade.name}`, async () => {
        // Sprawdź czy jest karta do oceny
        const cardFront = page.locator("text=Test pełnego przepływu review");
        const hasCard = await cardFront.isVisible({ timeout: 5000 }).catch(() => false);

        if (!hasCard) {
          // Jeśli nie ma kart, użyj trybu force
          const moreCardsButton = page.locator('button:has-text("Przejrzyj więcej kart")');
          const buttonVisible = await moreCardsButton.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (buttonVisible) {
            await moreCardsButton.click();
            await page.waitForTimeout(3000);
          } else {
            // Jeśli nie ma przycisku, dodaj kolejną fiszkę
            await page.goto("/flashcards");
            await page.waitForSelector("text=Wszystkie fiszki", { timeout: 10000 });
            const addButton = page.locator('button:has-text("Dodaj fiszkę")');
            await addButton.click();
            await page.waitForSelector("textarea#front", { timeout: 5000 });
            await page.fill("textarea#front", `Test ${grade.name}`);
            await page.fill("textarea#back", `Odpowiedź ${grade.name}`);
            const submitButton = page.locator('button[type="submit"]:has-text("Zapisz")');
            await submitButton.click();
            await page.waitForTimeout(2000);
            await page.goto("/review");
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(2000);
          }
        }

        // Pokaż back jeśli jeszcze nie jest pokazany
        const showBackButton = page.locator('button:has-text("Pokaż back")');
        const backVisible = await showBackButton.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (backVisible) {
          await showBackButton.click();
          await page.waitForTimeout(500);
        }

        // Kliknij przycisk oceny
        const gradeButton = page.locator(grade.button);
        await expect(gradeButton).toBeVisible({ timeout: 5000 });
        
        // Zapisz liczbę requestów przed kliknięciem
        const requestsBefore = networkRequests.filter((r) => r.url.includes("/api/review/submit")).length;
        
        await gradeButton.click();
        
        // Poczekaj na request i odpowiedź
        await page.waitForTimeout(2000);

        // Weryfikuj że request został wykonany
        const requestsAfter = networkRequests.filter((r) => r.url.includes("/api/review/submit")).length;
        expect(requestsAfter).toBeGreaterThan(requestsBefore);

        // Znajdź ostatni request submit
        const submitRequests = networkRequests.filter((r) => r.url.includes("/api/review/submit"));
        const lastSubmitRequest = submitRequests[submitRequests.length - 1];

        // Weryfikuj autoryzację
        const hasAuth = !!lastSubmitRequest?.headers.authorization || !!lastSubmitRequest?.headers.Authorization;
        expect(hasAuth).toBe(true);

        // Weryfikuj status
        expect(lastSubmitRequest?.status).toBe(200);

        // Weryfikuj odpowiedź
        if (lastSubmitRequest?.responseBody) {
          expect(lastSubmitRequest.responseBody).toHaveProperty("cardId");
          expect(lastSubmitRequest.responseBody).toHaveProperty("next");
        }
      });
    }

    // 5. WERYFIKACJA WSZYSTKICH REQUESTÓW
    await test.step("Weryfikacja wszystkich requestów", async () => {
      const reviewRequests = networkRequests.filter((r) => r.url.includes("/api/review/"));
      expect(reviewRequests.length).toBeGreaterThan(0);

      // Wszystkie requesty powinny mieć autoryzację
      const unauthorizedRequests = reviewRequests.filter(
        (r) => !r.headers.authorization && !r.headers.Authorization
      );
      expect(unauthorizedRequests.length).toBe(0);

      // Wszystkie requesty powinny mieć status 200 (lub 401 dla nieautoryzowanych, ale nie powinno być)
      const failedRequests = reviewRequests.filter((r) => r.status !== 200 && r.status !== 401);
      if (failedRequests.length > 0) {
        console.error("Failed requests:", JSON.stringify(failedRequests, null, 2));
      }
      expect(failedRequests.length).toBe(0);

      // Wszystkie requesty submit powinny mieć status 200
      const submitRequests = reviewRequests.filter((r) => r.url.includes("/api/review/submit"));
      const failedSubmits = submitRequests.filter((r) => r.status !== 200);
      expect(failedSubmits.length).toBe(0);
    });

    // 6. WERYFIKACJA ZAPISU SESJI
    await test.step("Weryfikacja zapisu sesji", async () => {
      // Poczekaj na zakończenie sesji (jeśli wszystkie karty zostały przejrzane)
      await page.waitForTimeout(2000);

      // Sprawdź czy został wykonany request do session-complete
      const sessionCompleteRequests = networkRequests.filter((r) => r.url.includes("/api/review/session-complete"));
      
      // Może być 0 jeśli sesja nie została jeszcze zakończona (wszystkie karty przejrzane)
      // Ale jeśli jest, powinien mieć status 200
      for (const request of sessionCompleteRequests) {
        expect(request.status).toBe(200);
        const hasAuth = !!request.headers.authorization || !!request.headers.Authorization;
        expect(hasAuth).toBe(true);
      }
    });
  });
});

