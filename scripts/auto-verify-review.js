#!/usr/bin/env node

/**
 * Automatyczna weryfikacja zmian w systemie review
 *
 * Ten skrypt jest uruchamiany automatycznie po każdej zmianie w endpointach review
 * Uruchamia testy E2E i analizuje logi, aby zweryfikować czy wszystko działa poprawnie
 *
 * Użycie:
 *   node scripts/auto-verify-review.js
 *
 * Lub jako część workflow:
 *   npm run test:e2e:verify-review
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const LOG_DIR = "logs";
const TEST_COMMAND = "npx playwright test tests/e2e/review-full-flow.spec.ts --reporter=list";
const INSTALL_BROWSERS_COMMAND = "npx playwright install chromium";
const INSTALL_DEPS_COMMAND = "npx playwright install-deps chromium";

/**
 * Sprawdź czy przeglądarki Playwright są zainstalowane
 * Sprawdza bezpośrednio czy plik przeglądarki istnieje
 */
function checkPlaywrightBrowsers() {
  try {
    // Sprawdź czy przeglądarka chromium jest zainstalowana
    // W Linux/WSL: ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome
    // W Windows: %USERPROFILE%\AppData\Local\ms-playwright\chromium-*\chrome-win\chrome.exe
    const homeDir = homedir();

    // Sprawdź katalog z przeglądarkami Playwright
    const playwrightDir = join(homeDir, ".cache", "ms-playwright");
    if (existsSync(playwrightDir)) {
      // Sprawdź czy jest jakikolwiek katalog chromium
      try {
        const dirs = readdirSync(playwrightDir);
        const hasChromium = dirs.some((dir) => dir.includes("chromium"));
        return hasChromium;
      } catch (e) {
        return false;
      }
    }

    // Sprawdź również lokalizację Windows
    const playwrightDirWin = join(homeDir, "AppData", "Local", "ms-playwright");
    if (existsSync(playwrightDirWin)) {
      try {
        const dirs = readdirSync(playwrightDirWin);
        const hasChromium = dirs.some((dir) => dir.includes("chromium"));
        return hasChromium;
      } catch (e) {
        return false;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Zainstaluj przeglądarki Playwright
 */
function installPlaywrightBrowsers() {
  console.log("📦 Instalowanie przeglądarek Playwright...");
  try {
    execSync(INSTALL_BROWSERS_COMMAND, { stdio: "inherit", cwd: process.cwd() });
    console.log("✅ Przeglądarki Playwright zainstalowane\n");
    return true;
  } catch (error) {
    console.error("❌ Błąd podczas instalacji przeglądarek Playwright");
    console.error("   Uruchom ręcznie: npx playwright install chromium\n");
    return false;
  }
}

/**
 * Zainstaluj zależności systemowe dla Playwright (Linux/WSL)
 */
function installPlaywrightDeps() {
  console.log("📦 Instalowanie zależności systemowych dla Playwright...");
  console.log("   (Może wymagać sudo - jeśli tak, uruchom ręcznie: sudo npx playwright install-deps chromium)\n");
  try {
    // Próbuj bez sudo najpierw (może działać w niektórych środowiskach)
    execSync(INSTALL_DEPS_COMMAND, { stdio: "inherit", cwd: process.cwd() });
    console.log("✅ Zależności systemowe zainstalowane\n");
    return true;
  } catch (error) {
    // Jeśli nie działa bez sudo, informuj użytkownika
    const errorOutput = (error.stdout?.toString() || error.stderr?.toString() || error.message || "").toLowerCase();
    if (errorOutput.includes("permission denied") || errorOutput.includes("sudo")) {
      console.warn("⚠️  Instalacja zależności wymaga uprawnień sudo");
      console.warn("   Uruchom ręcznie: sudo npx playwright install-deps chromium");
      console.warn("   Lub: sudo apt-get install libnspr4 libnss3 libasound2t64\n");
      return false;
    }
    console.error("❌ Błąd podczas instalacji zależności systemowych");
    console.error("   Uruchom ręcznie: sudo npx playwright install-deps chromium\n");
    return false;
  }
}

/**
 * Pobierz najnowszy plik logu
 */
function getLatestLogFile() {
  if (!existsSync(LOG_DIR)) {
    return null;
  }

  try {
    const files = readdirSync(LOG_DIR)
      .filter((f) => f.startsWith("app-") && f.endsWith(".log"))
      .map((f) => ({
        name: f,
        path: join(LOG_DIR, f),
        mtime: statSync(join(LOG_DIR, f)).mtime,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    return files.length > 0 ? files[0].path : null;
  } catch (error) {
    console.error("❌ Błąd podczas odczytywania katalogu logów:", error.message);
    return null;
  }
}

/**
 * Analizuj logi pod kątem błędów związanych z review
 */
function analyzeLogs(logFilePath) {
  if (!logFilePath) {
    console.log("⚠️  Brak pliku logów do analizy");
    return { errors: [], warnings: [], info: [] };
  }

  try {
    const logContent = readFileSync(logFilePath, "utf-8");
    const lines = logContent.split("\n").filter((line) => line.trim());

    const errors = [];
    const warnings = [];
    const info = [];

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);

        // Filtruj tylko wpisy związane z review
        if (
          entry.component?.includes("review") ||
          entry.message?.toLowerCase().includes("review") ||
          entry.context?.url?.includes("/api/review/")
        ) {
          if (entry.level === "ERROR" || entry.level === "CRITICAL") {
            errors.push(entry);
          } else if (entry.level === "WARNING") {
            warnings.push(entry);
          } else if (entry.level === "INFO" || entry.level === "DEBUG") {
            info.push(entry);
          }
        }
      } catch (e) {
        // Ignoruj linie które nie są JSON
      }
    }

    return { errors, warnings, info };
  } catch (error) {
    console.error("❌ Błąd podczas analizy logów:", error.message);
    return { errors: [], warnings: [], info: [] };
  }
}

/**
 * Sprawdź czy są błędy RLS
 */
function checkRLSErrors(errors) {
  const rlsErrors = errors.filter(
    (e) =>
      e.error?.message?.includes("row-level security") ||
      e.error?.message?.includes("RLS") ||
      e.context?.error?.message?.includes("row-level security") ||
      e.context?.error?.code === "42501"
  );

  return rlsErrors;
}

/**
 * Sprawdź czy są błędy autoryzacji
 */
function checkAuthErrors(errors) {
  const authErrors = errors.filter(
    (e) =>
      e.message?.toLowerCase().includes("unauthorized") ||
      e.message?.toLowerCase().includes("401") ||
      e.context?.status === 401 ||
      e.context?.statusCode === 401
  );

  return authErrors;
}

/**
 * Sprawdź czy są błędy sesji
 */
function checkSessionErrors(errors) {
  const sessionErrors = errors.filter(
    (e) =>
      e.message?.toLowerCase().includes("session") ||
      e.error?.message?.toLowerCase().includes("session") ||
      e.context?.error?.message?.toLowerCase().includes("session")
  );

  return sessionErrors;
}

/**
 * Sprawdź czy requesty mają poprawne statusy
 */
function checkRequestStatuses(info) {
  const requests = info.filter((i) => i.message?.includes("API request completed"));
  const failedRequests = requests.filter((r) => r.context?.statusCode && r.context.statusCode >= 400);

  return { total: requests.length, failed: failedRequests.length, failedRequests };
}

/**
 * Sprawdź czy są błędy 500
 */
function check500Errors(errors) {
  const serverErrors = errors.filter(
    (e) =>
      e.context?.status === 500 ||
      e.context?.statusCode === 500 ||
      e.message?.toLowerCase().includes("500") ||
      e.message?.toLowerCase().includes("internal server error")
  );

  return serverErrors;
}

/**
 * Główna funkcja
 */
function main() {
  console.log("🚀 Automatyczna weryfikacja zmian w systemie review\n");
  console.log("=".repeat(60));
  console.log();

  // 0. Sprawdź czy przeglądarki Playwright są zainstalowane (opcjonalnie)
  // Jeśli nie są, zostaną zainstalowane automatycznie po wykryciu błędu w testach
  console.log("📋 Krok 0: Sprawdzanie przeglądarek Playwright...");
  const browsersInstalled = checkPlaywrightBrowsers();
  if (browsersInstalled) {
    console.log("✅ Przeglądarki Playwright są zainstalowane\n");
  } else {
    console.log("⚠️  Przeglądarki Playwright mogą nie być zainstalowane");
    console.log("   Zostaną zainstalowane automatycznie jeśli potrzeba\n");
  }

  // 1. Uruchom testy E2E
  console.log("📋 Krok 1: Uruchamianie testów E2E...");
  let testPassed = false;
  let testOutput = "";
  try {
    // Uruchom testy i przechwyć output
    testOutput = execSync(TEST_COMMAND, {
      encoding: "utf-8",
      stdio: ["inherit", "pipe", "pipe"],
      cwd: process.cwd(),
    });
    console.log(testOutput);
    console.log("\n✅ Testy E2E zakończone pomyślnie\n");
    testPassed = true;
  } catch (error) {
    // Przechwyć output z błędem
    const stdout = error.stdout?.toString() || "";
    const stderr = error.stderr?.toString() || "";
    const errorMessage = error.message || "";
    testOutput = stdout + stderr + errorMessage;

    // Wyświetl output
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    // Sprawdź czy błąd dotyczy brakujących przeglądarek
    const errorOutput = testOutput.toLowerCase();
    const isBrowserMissing =
      errorOutput.includes("executable doesn't exist") ||
      errorOutput.includes("playwright install") ||
      errorOutput.includes("chromium_headless_shell") ||
      errorOutput.includes("chrome-linux") ||
      errorOutput.includes("headless_shell") ||
      errorOutput.includes("please run the following command");

    // Sprawdź czy błąd dotyczy brakujących zależności systemowych
    const isDepsMissing =
      errorOutput.includes("host system is missing dependencies") ||
      errorOutput.includes("install-deps") ||
      errorOutput.includes("libnspr4") ||
      errorOutput.includes("libnss3") ||
      errorOutput.includes("libasound2");

    if (isBrowserMissing || isDepsMissing) {
      if (isDepsMissing) {
        console.error("\n⚠️  Brakują zależności systemowe dla Playwright");
        console.log("📦 Próbuję zainstalować zależności...\n");
        installPlaywrightDeps();
      }

      if (isBrowserMissing) {
        console.error("\n⚠️  Przeglądarki Playwright nie są zainstalowane");
        console.log("📦 Próbuję zainstalować przeglądarki...\n");
        installPlaywrightBrowsers();
      }

      // Spróbuj ponownie uruchomić testy
      console.log("📋 Ponowne uruchamianie testów E2E...");
      try {
        testOutput = execSync(TEST_COMMAND, {
          encoding: "utf-8",
          stdio: ["inherit", "pipe", "pipe"],
          cwd: process.cwd(),
        });
        console.log(testOutput);
        console.log("\n✅ Testy E2E zakończone pomyślnie\n");
        testPassed = true;
      } catch (retryError) {
        const retryStdout = retryError.stdout?.toString() || "";
        const retryStderr = retryError.stderr?.toString() || "";
        if (retryStdout) console.log(retryStdout);
        if (retryStderr) console.error(retryStderr);

        const retryErrorOutput = (retryStdout + retryStderr).toLowerCase();
        if (
          retryErrorOutput.includes("host system is missing dependencies") ||
          retryErrorOutput.includes("install-deps")
        ) {
          console.error("\n❌ Testy E2E zakończone z błędami - wymagane zależności systemowe");
          console.error("   Uruchom ręcznie: sudo npx playwright install-deps chromium");
          console.error("   Lub: sudo apt-get install libnspr4 libnss3 libasound2t64");
          console.error("   Kontynuuję analizę logów...\n");
        } else {
          console.error("\n❌ Testy E2E zakończone z błędami po ponownej próbie");
          console.error("   Kontynuuję analizę logów...\n");
        }
        testPassed = false;
      }
    } else {
      console.error("\n❌ Testy E2E zakończone z błędami");
      console.error("   Kontynuuję analizę logów...\n");
      testPassed = false;
    }
  }

  // 2. Analizuj logi
  console.log("📋 Krok 2: Analiza logów...");
  const logFilePath = getLatestLogFile();
  if (logFilePath) {
    console.log(`   📄 Analizuję plik: ${logFilePath}\n`);
  } else {
    console.log("   ⚠️  Brak pliku logów do analizy\n");
  }

  const { errors, warnings, info } = analyzeLogs(logFilePath);

  // 3. Sprawdź błędy RLS
  console.log("📋 Krok 3: Sprawdzanie błędów RLS...");
  const rlsErrors = checkRLSErrors(errors);
  if (rlsErrors.length > 0) {
    console.error(`❌ Znaleziono ${rlsErrors.length} błędów RLS:`);
    rlsErrors.slice(0, 5).forEach((e, i) => {
      console.error(`   ${i + 1}. ${e.message}`);
      if (e.error?.message) {
        console.error(`      ${e.error.message}`);
      }
    });
    if (rlsErrors.length > 5) {
      console.error(`   ... i ${rlsErrors.length - 5} więcej`);
    }
    console.log();
  } else {
    console.log("✅ Brak błędów RLS\n");
  }

  // 4. Sprawdź błędy autoryzacji
  console.log("📋 Krok 4: Sprawdzanie błędów autoryzacji...");
  const authErrors = checkAuthErrors(errors);
  if (authErrors.length > 0) {
    console.error(`❌ Znaleziono ${authErrors.length} błędów autoryzacji:`);
    authErrors.slice(0, 5).forEach((e, i) => {
      console.error(`   ${i + 1}. ${e.message}`);
      if (e.context?.status || e.context?.statusCode) {
        console.error(`      Status: ${e.context.status || e.context.statusCode}`);
      }
    });
    if (authErrors.length > 5) {
      console.error(`   ... i ${authErrors.length - 5} więcej`);
    }
    console.log();
  } else {
    console.log("✅ Brak błędów autoryzacji\n");
  }

  // 5. Sprawdź błędy 500
  console.log("📋 Krok 5: Sprawdzanie błędów 500 (Internal Server Error)...");
  const serverErrors = check500Errors(errors);
  if (serverErrors.length > 0) {
    console.error(`❌ Znaleziono ${serverErrors.length} błędów 500:`);
    serverErrors.slice(0, 5).forEach((e, i) => {
      console.error(`   ${i + 1}. ${e.message}`);
      if (e.context?.url) {
        console.error(`      URL: ${e.context.url}`);
      }
    });
    if (serverErrors.length > 5) {
      console.error(`   ... i ${serverErrors.length - 5} więcej`);
    }
    console.log();
  } else {
    console.log("✅ Brak błędów 500\n");
  }

  // 6. Sprawdź błędy sesji
  console.log("📋 Krok 6: Sprawdzanie błędów sesji...");
  const sessionErrors = checkSessionErrors(errors);
  if (sessionErrors.length > 0) {
    console.warn(`⚠️  Znaleziono ${sessionErrors.length} błędów sesji:`);
    sessionErrors.slice(0, 3).forEach((e, i) => {
      console.warn(`   ${i + 1}. ${e.message}`);
    });
    if (sessionErrors.length > 3) {
      console.warn(`   ... i ${sessionErrors.length - 3} więcej`);
    }
    console.log();
  } else {
    console.log("✅ Brak błędów sesji\n");
  }

  // 7. Sprawdź statusy requestów
  console.log("📋 Krok 7: Sprawdzanie statusów requestów...");
  const { total, failed, failedRequests } = checkRequestStatuses(info);
  console.log(`   📊 Łącznie requestów: ${total}`);
  console.log(`   ❌ Nieudanych: ${failed}`);
  if (failed > 0) {
    console.error("   Błędy:");
    failedRequests.slice(0, 5).forEach((r, i) => {
      console.error(`      ${i + 1}. ${r.context?.url || r.context?.method} - Status: ${r.context?.statusCode}`);
    });
    if (failedRequests.length > 5) {
      console.error(`      ... i ${failedRequests.length - 5} więcej`);
    }
  }
  console.log();

  // 8. Podsumowanie
  console.log("=".repeat(60));
  console.log("📋 PODSUMOWANIE:");
  console.log("=".repeat(60));

  const hasErrors = rlsErrors.length > 0 || authErrors.length > 0 || serverErrors.length > 0 || failed > 0;

  if (!testPassed) {
    console.error("❌ Testy E2E nie przeszły");
  }

  if (hasErrors) {
    console.error("❌ Weryfikacja zakończona z błędami:");
    console.error(`   - Błędy RLS: ${rlsErrors.length}`);
    console.error(`   - Błędy autoryzacji: ${authErrors.length}`);
    console.error(`   - Błędy 500: ${serverErrors.length}`);
    console.error(`   - Nieudane requesty: ${failed}`);
    console.error(`   - Ostrzeżenia sesji: ${sessionErrors.length}`);
    console.log();
    console.error("💡 Wskazówki:");
    if (rlsErrors.length > 0) {
      console.error("   - Sprawdź czy setSession jest wywoływane przed zapytaniem do bazy");
      console.error("   - Sprawdź czy refresh_token jest przekazywany do setSession");
    }
    if (authErrors.length > 0) {
      console.error("   - Sprawdź czy Authorization header jest wysyłany z requestów");
      console.error("   - Sprawdź czy token jest poprawny");
    }
    if (serverErrors.length > 0) {
      console.error("   - Sprawdź logi serwera dla szczegółów błędów 500");
      console.error("   - Sprawdź czy wszystkie zmienne są zdefiniowane przed użyciem");
    }
    process.exit(1);
  } else {
    console.log("✅ Weryfikacja zakończona pomyślnie!");
    console.log("   Wszystkie testy przeszły, brak błędów w logach.");
    if (sessionErrors.length > 0) {
      console.log(`   ⚠️  Ostrzeżenia sesji: ${sessionErrors.length} (można zignorować jeśli nie są krytyczne)`);
    }
    process.exit(0);
  }
}

main();
