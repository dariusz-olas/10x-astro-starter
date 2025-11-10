import { test, expect } from "@playwright/test";

/**
 * Testy E2E dla systemu wersjonowania aplikacji
 */
test.describe("System wersjonowania", () => {
  test("API endpoint /api/version zwraca poprawny format wersji", async ({ page }) => {
    // Wykonaj request do endpointu /api/version
    const response = await page.request.get("/api/version");

    // Sprawdź status code
    expect(response.status()).toBe(200);

    // Sprawdź Content-Type
    expect(response.headers()["content-type"]).toContain("application/json");

    // Sprawdź Cache-Control
    const cacheControl = response.headers()["cache-control"];
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("max-age=300");

    // Parsuj JSON response
    const json = await response.json();

    // Sprawdź strukturę odpowiedzi
    expect(json).toHaveProperty("version");
    expect(typeof json.version).toBe("string");

    // Sprawdź format wersji (YYYY-MM-DD.N)
    const versionRegex = /^\d{4}-\d{2}-\d{2}\.\d+$/;
    expect(json.version).toMatch(versionRegex);

    console.log(`✓ Version API returned: ${json.version}`);
  });

  test("VersionDisplay jest widoczny po zalogowaniu (desktop)", async ({ page }) => {
    // Unikalny email dla testu
    const uniqueEmail = `test-version-${Date.now()}@example.com`;
    const password = "testpassword123";

    // Rejestracja użytkownika
    await test.step("Rejestracja użytkownika", async () => {
      await page.goto("/register");
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    // Sprawdź czy VersionDisplay jest widoczny
    await test.step("Sprawdzenie VersionDisplay", async () => {
      // Ustaw viewport na desktop (VersionDisplay jest ukryty na mobile)
      await page.setViewportSize({ width: 1280, height: 720 });

      // Poczekaj na załadowanie strony
      await page.waitForLoadState("networkidle");

      // Znajdź element z wersją (v{version})
      const versionDisplay = page.locator('[role="status"][aria-label*="Application version"]');

      // Sprawdź czy element istnieje i jest widoczny
      await expect(versionDisplay).toBeVisible({ timeout: 10000 });

      // Sprawdź tekst wewnątrz (powinien zaczynać się od "v")
      const versionText = await versionDisplay.textContent();
      expect(versionText).toMatch(/^v\d{4}-\d{2}-\d{2}\.\d+/);

      console.log(`✓ VersionDisplay pokazuje: ${versionText}`);
    });
  });

  test("VersionDisplay jest ukryty na mobile", async ({ page }) => {
    // Unikalny email dla testu
    const uniqueEmail = `test-version-mobile-${Date.now()}@example.com`;
    const password = "testpassword123";

    // Rejestracja użytkownika
    await test.step("Rejestracja użytkownika", async () => {
      await page.goto("/register");
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    // Sprawdź czy VersionDisplay jest ukryty na mobile
    await test.step("Sprawdzenie VersionDisplay na mobile", async () => {
      // Ustaw viewport na mobile
      await page.setViewportSize({ width: 375, height: 667 });

      // Poczekaj na załadowanie strony
      await page.waitForLoadState("networkidle");

      // Znajdź element z wersją
      const versionDisplay = page.locator('[role="status"][aria-label*="Application version"]');

      // Na mobile element może istnieć w DOM, ale być ukryty przez CSS (sm:block hidden)
      // Sprawdź czy nie jest widoczny
      const isVisible = await versionDisplay.isVisible().catch(() => false);
      expect(isVisible).toBe(false);

      console.log("✓ VersionDisplay jest ukryty na mobile (responsive design)");
    });
  });

  test("UserMenu jest widoczny po zalogowaniu", async ({ page }) => {
    // Unikalny email dla testu
    const uniqueEmail = `test-usermenu-${Date.now()}@example.com`;
    const password = "testpassword123";

    // Rejestracja użytkownika
    await test.step("Rejestracja użytkownika", async () => {
      await page.goto("/register");
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    // Sprawdź czy UserMenu jest widoczny
    await test.step("Sprawdzenie UserMenu", async () => {
      // Poczekaj na załadowanie strony
      await page.waitForLoadState("networkidle");

      // Znajdź button z aria-label="User menu"
      const userMenuButton = page.locator('button[aria-label="User menu"]');

      // Sprawdź czy button jest widoczny
      await expect(userMenuButton).toBeVisible({ timeout: 10000 });

      // Sprawdź czy zawiera email użytkownika (na desktop)
      await page.setViewportSize({ width: 1280, height: 720 });
      const buttonText = await userMenuButton.textContent();
      expect(buttonText).toContain(uniqueEmail);

      console.log(`✓ UserMenu pokazuje email: ${uniqueEmail}`);
    });
  });

  test("UserMenu dropdown działa poprawnie", async ({ page }) => {
    // Unikalny email dla testu
    const uniqueEmail = `test-dropdown-${Date.now()}@example.com`;
    const password = "testpassword123";

    // Rejestracja użytkownika
    await test.step("Rejestracja użytkownika", async () => {
      await page.goto("/register");
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    // Sprawdź funkcjonalność dropdown menu
    await test.step("Test dropdown menu", async () => {
      // Znajdź button UserMenu
      const userMenuButton = page.locator('button[aria-label="User menu"]');
      await expect(userMenuButton).toBeVisible();

      // Sprawdź że menu jest zamknięte (aria-expanded="false")
      await expect(userMenuButton).toHaveAttribute("aria-expanded", "false");

      // Kliknij button aby otworzyć menu
      await userMenuButton.click();

      // Sprawdź że menu jest otwarte (aria-expanded="true")
      await expect(userMenuButton).toHaveAttribute("aria-expanded", "true");

      // Sprawdź czy menu items są widoczne
      const profileButton = page.locator('button[role="menuitem"]:has-text("Profil")');
      const logoutButton = page.locator('button[role="menuitem"]:has-text("Wyloguj się")');

      await expect(profileButton).toBeVisible();
      await expect(logoutButton).toBeVisible();

      console.log("✓ UserMenu dropdown działa poprawnie");
    });
  });

  test("UserMenu zamyka się po kliknięciu ESC", async ({ page }) => {
    // Unikalny email dla testu
    const uniqueEmail = `test-esc-${Date.now()}@example.com`;
    const password = "testpassword123";

    // Rejestracja użytkownika
    await test.step("Rejestracja użytkownika", async () => {
      await page.goto("/register");
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    });

    // Test klawisza ESC
    await test.step("Test zamykania menu klawiszem ESC", async () => {
      const userMenuButton = page.locator('button[aria-label="User menu"]');
      await expect(userMenuButton).toBeVisible();

      // Otwórz menu
      await userMenuButton.click();
      await expect(userMenuButton).toHaveAttribute("aria-expanded", "true");

      // Naciśnij ESC
      await page.keyboard.press("Escape");

      // Sprawdź że menu jest zamknięte
      await expect(userMenuButton).toHaveAttribute("aria-expanded", "false");

      console.log("✓ Menu zamyka się po ESC (accessibility)");
    });
  });

  test("Wersja jest zgodna między API a UI", async ({ page }) => {
    // Unikalny email dla testu
    const uniqueEmail = `test-consistency-${Date.now()}@example.com`;
    const password = "testpassword123";

    // Pobierz wersję z API
    const apiResponse = await page.request.get("/api/version");
    const apiJson = await apiResponse.json();
    const apiVersion = apiJson.version;

    // Rejestracja użytkownika
    await test.step("Rejestracja i weryfikacja wersji w UI", async () => {
      await page.goto("/register");
      await page.fill("input#email", uniqueEmail);
      await page.fill("input#password", password);
      await page.fill("input#confirmPassword", password);
      await page.click('button:has-text("Zarejestruj się")');
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });

      // Ustaw viewport na desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.waitForLoadState("networkidle");

      // Pobierz wersję z UI
      const versionDisplay = page.locator('[role="status"][aria-label*="Application version"]');
      await expect(versionDisplay).toBeVisible({ timeout: 10000 });

      const uiVersionText = await versionDisplay.textContent();
      const uiVersion = uiVersionText
        ?.replace(/^v/, "")
        .replace(/\s*⚠.*$/, "")
        .trim();

      // Porównaj wersje
      expect(uiVersion).toBe(apiVersion);

      console.log(`✓ Wersja jest spójna: API=${apiVersion}, UI=${uiVersion}`);
    });
  });
});
