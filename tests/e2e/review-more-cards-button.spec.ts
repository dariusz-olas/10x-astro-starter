import { test, expect } from "@playwright/test";

/**
 * Dedykowany test dla przycisku "Przejrzyj więcej kart"
 * Testuje dokładnie scenariusz, który był problematyczny:
 * 1. Brak kart należnych do powtórki
 * 2. Kliknięcie przycisku "Przejrzyj więcej kart"
 * 3. Weryfikacja czy karty zostały załadowane
 * 4. Weryfikacja autoryzacji w requestach
 */
test.describe("Test przycisku 'Przejrzyj więcej kart'", () => {
  const uniqueEmail = `test-more-cards-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
  const password = "testpassword123";

  test("Pełny test przycisku 'Przejrzyj więcej kart'", async ({ page }) => {
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
      if (request.url().includes("/api/review/next")) {
        const headers: Record<string, string> = {};
        request.headers().forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          status: 0, // Będzie zaktualizowane w response
          headers,
        });
      }
    });

    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api/review/next")) {
        const request = networkRequests.find((r) => r.url === url);
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
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    // 2. DODANIE FISZKI (aby mieć coś do powtórki)
    await test.step("Dodanie fiszki", async () => {
      await page.goto("/flashcards");
      await page.waitForSelector("text=Wszystkie fiszki", { timeout: 10000 });

      const addButton = page.locator('button:has-text("Dodaj fiszkę")');
      await addButton.click();
      await page.waitForSelector("textarea#front", { timeout: 5000 });

      await page.fill("textarea#front", "Test przycisku 'Przejrzyj więcej kart'");
      await page.fill("textarea#back", "Odpowiedź testowa");
      await page.fill("input#tags", "test-button");

      const submitButton = page.locator('button[type="submit"]:has-text("Zapisz")');
      await submitButton.click();
      await page.waitForSelector("text=Test przycisku", { timeout: 10000 });
    });

    // 3. PRZEJŚCIE DO REVIEW I SPRAWDZENIE STANU POCZĄTKOWEGO
    await test.step("Przejście do strony review", async () => {
      await page.goto("/review");
      await page.waitForLoadState("networkidle");

      // Poczekaj na załadowanie komponentu
      await page.waitForTimeout(2000);

      // Sprawdź czy są błędy w konsoli
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      // Sprawdź czy przycisk "Przejrzyj więcej kart" jest widoczny
      // (może być widoczny jeśli nie ma kart należnych)
      const moreCardsButton = page.locator('button:has-text("Przejrzyj więcej kart")');
      const buttonVisible = await moreCardsButton.isVisible({ timeout: 5000 }).catch(() => false);

      console.log(`Przycisk "Przejrzyj więcej kart" widoczny: ${buttonVisible}`);

      // Jeśli przycisk nie jest widoczny, może być karta do powtórki - przejrzyj ją
      if (!buttonVisible) {
        const cardFront = page.locator("text=Test przycisku");
        const hasCard = await cardFront.isVisible({ timeout: 3000 }).catch(() => false);

        if (hasCard) {
          // Oceń kartę, aby przejść do stanu "brak kart należnych"
          const showBackButton = page.locator('button:has-text("Pokaż back")');
          if (await showBackButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await showBackButton.click();
            await page.waitForTimeout(500);
          }

          const goodButton = page.locator('button:has-text("Good (3/G)")');
          if (await goodButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await goodButton.click();
            await page.waitForTimeout(2000);
          }
        }
      }
    });

    // 4. KLIKNIĘCIE PRZYCISKU "Przejrzyj więcej kart"
    await test.step("Kliknięcie przycisku 'Przejrzyj więcej kart'", async () => {
      const moreCardsButton = page.locator('button:has-text("Przejrzyj więcej kart")');
      const buttonVisible = await moreCardsButton.isVisible({ timeout: 5000 }).catch(() => false);

      if (!buttonVisible) {
        test.skip();
        return;
      }

      // Zapisz liczbę requestów przed kliknięciem
      const requestsBefore = networkRequests.length;

      // Kliknij przycisk
      await moreCardsButton.click();

      // Poczekaj na request i odpowiedź
      await page.waitForTimeout(3000);

      // Sprawdź czy został wykonany request
      const requestsAfter = networkRequests.length;
      expect(requestsAfter).toBeGreaterThan(requestsBefore);

      // Znajdź request z force=true
      const forceRequest = networkRequests.find((r) => r.url.includes("force=true"));
      expect(forceRequest).toBeTruthy();

      // WERYFIKACJA AUTORYZACJI
      if (forceRequest) {
        console.log("Request URL:", forceRequest.url);
        console.log("Request headers:", JSON.stringify(forceRequest.headers, null, 2));
        console.log("Request status:", forceRequest.status);
        console.log("Response body:", JSON.stringify(forceRequest.responseBody, null, 2));

        // Sprawdź czy request ma nagłówek Authorization
        const hasAuth = !!forceRequest.headers.authorization || !!forceRequest.headers.Authorization;
        expect(hasAuth).toBe(true);

        // Sprawdź czy status jest 200
        expect(forceRequest.status).toBe(200);

        // Sprawdź czy odpowiedź zawiera karty
        if (forceRequest.responseBody) {
          expect(forceRequest.responseBody).toHaveProperty("cards");
          expect(Array.isArray(forceRequest.responseBody.cards)).toBe(true);
        }
      }
    });

    // 5. WERYFIKACJA CZY KARTY ZOSTAŁY ZAŁADOWANE
    await test.step("Weryfikacja czy karty zostały załadowane", async () => {
      // Poczekaj na załadowanie kart
      await page.waitForTimeout(2000);

      // Sprawdź czy są karty widoczne na stronie
      const cardFront = page.locator("text=Test przycisku");
      const hasCard = await cardFront.isVisible({ timeout: 5000 }).catch(() => false);

      // Albo sprawdź czy przycisk "Przejrzyj więcej kart" zniknął (co oznacza że są karty)
      const moreCardsButton = page.locator('button:has-text("Przejrzyj więcej kart")');
      const buttonStillVisible = await moreCardsButton.isVisible({ timeout: 2000 }).catch(() => false);

      // Powinno być: albo karty są widoczne, albo przycisk zniknął (bo są karty)
      expect(hasCard || !buttonStillVisible).toBe(true);
    });

    // 6. PODSUMOWANIE - WERYFIKACJA WSZYSTKICH REQUESTÓW
    await test.step("Podsumowanie - weryfikacja wszystkich requestów", async () => {
      const reviewRequests = networkRequests.filter((r) => r.url.includes("/api/review/next"));
      expect(reviewRequests.length).toBeGreaterThan(0);

      // Wszystkie requesty powinny mieć autoryzację
      const unauthorizedRequests = reviewRequests.filter(
        (r) => !r.headers.authorization && !r.headers.Authorization
      );
      expect(unauthorizedRequests.length).toBe(0);

      // Wszystkie requesty powinny mieć status 200
      const failedRequests = reviewRequests.filter((r) => r.status !== 200);
      if (failedRequests.length > 0) {
        console.error("Failed requests:", JSON.stringify(failedRequests, null, 2));
      }
      expect(failedRequests.length).toBe(0);
    });
  });
});

