import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * Testy weryfikujące logi serwerowe po wykonaniu akcji
 * Wymaga dostępu do plików logów w katalogu logs/
 */
test.describe("Weryfikacja logów serwerowych", () => {
  const logsDir = join(process.cwd(), "logs");

  function readLogFile(filename: string): string[] {
    const filePath = join(logsDir, filename);
    if (!existsSync(filePath)) {
      return [];
    }
    try {
      const content = readFileSync(filePath, "utf-8");
      return content.split("\n").filter((line) => line.trim().length > 0);
    } catch (error) {
      return [];
    }
  }

  function parseLogLine(line: string): any {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }

  test("Weryfikacja logów po wykonaniu akcji", async ({ page }) => {
    const uniqueEmail = `test-logs-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
    const password = "testpassword123";

    // Pobierz aktualną datę dla nazwy pliku logów
    const today = new Date().toISOString().split("T")[0];
    const logFile = `app-${today}.log`;

    // Wykonaj akcje, które powinny być zalogowane
    await test.step("Rejestracja i podstawowe akcje", async () => {
      await page.goto("/register");
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });

      await page.goto("/flashcards");
      await page.waitForLoadState("networkidle");

      await page.goto("/review");
      await page.waitForLoadState("networkidle");
    });

    // Poczekaj chwilę, aby logi zostały zapisane
    await page.waitForTimeout(2000);

    // Sprawdź logi
    await test.step("Weryfikacja logów", async () => {
      const logLines = readLogFile(logFile);
      expect(logLines.length).toBeGreaterThan(0);

      // Parsuj logi
      const logs = logLines.map(parseLogLine).filter((log) => log !== null);

      // Sprawdź czy są logi dla requestów API
      const apiLogs = logs.filter((log) => log.component && log.component.startsWith("/api/"));
      expect(apiLogs.length).toBeGreaterThan(0);

      // Sprawdź czy wszystkie logi mają requestId
      apiLogs.forEach((log) => {
        expect(log.requestId).toBeTruthy();
        expect(log.requestId).toMatch(/^req-/);
      });

      // Sprawdź czy nie ma błędów ERROR
      const errorLogs = logs.filter((log) => log.level === "ERROR");
      expect(errorLogs.length).toBe(0);

      // Sprawdź czy requesty do /api/review/* mają nagłówek authorization
      const reviewLogs = apiLogs.filter((log) => log.component.includes("/api/review/"));
      if (reviewLogs.length > 0) {
        reviewLogs.forEach((log) => {
          if (log.context && log.context.headers) {
            const hasAuth = !!log.context.headers.authorization;
            expect(hasAuth).toBe(true);
          }
        });
      }

      // Sprawdź czy requesty mają status 200 (sukces)
      const completedLogs = logs.filter(
        (log) => log.message === "API request completed" && log.context && log.context.statusCode
      );
      completedLogs.forEach((log) => {
        expect(log.context.statusCode).toBe(200);
      });
    });
  });

  test("Weryfikacja spójności requestId w logach", async ({ page }) => {
    const today = new Date().toISOString().split("T")[0];
    const logFile = `app-${today}.log`;

    // Wykonaj kilka requestów
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await page.goto("/flashcards");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    await page.goto("/review");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Sprawdź logi
    const logLines = readLogFile(logFile);
    const logs = logLines.map(parseLogLine).filter((log) => log !== null);

    // Znajdź requesty i pogrupuj je po requestId
    const requestGroups: Record<string, any[]> = {};
    logs.forEach((log) => {
      if (log.requestId) {
        if (!requestGroups[log.requestId]) {
          requestGroups[log.requestId] = [];
        }
        requestGroups[log.requestId].push(log);
      }
    });

    // Sprawdź czy każdy requestId ma przynajmniej 2 logi (start i end)
    Object.keys(requestGroups).forEach((requestId) => {
      const groupLogs = requestGroups[requestId];
      expect(groupLogs.length).toBeGreaterThanOrEqual(2);

      // Sprawdź czy jest log "API request started" i "API request completed"
      const hasStart = groupLogs.some((log) => log.message === "API request started");
      const hasEnd = groupLogs.some((log) => log.message === "API request completed");
      expect(hasStart).toBe(true);
      expect(hasEnd).toBe(true);
    });
  });
});
