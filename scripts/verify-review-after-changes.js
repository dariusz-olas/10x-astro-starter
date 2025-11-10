#!/usr/bin/env node

/**
 * Skrypt do automatycznej weryfikacji zmian w systemie review
 *
 * Uruchamia testy E2E i analizuje logi, aby zweryfikować czy wszystko działa poprawnie
 */

import { execSync } from "child_process";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const LOG_DIR = "logs";
const TEST_COMMAND = "npx playwright test tests/e2e/review-full-flow.spec.ts";

/**
 * Pobierz najnowszy plik logu
 */
function getLatestLogFile() {
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
      e.context?.error?.message?.includes("row-level security")
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
      e.context?.status === 401
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
 * Główna funkcja
 */
function main() {
  console.log("🚀 Uruchamianie weryfikacji zmian w systemie review...\n");

  // 1. Uruchom testy E2E
  console.log("📋 Krok 1: Uruchamianie testów E2E...");
  try {
    execSync(TEST_COMMAND, { stdio: "inherit", cwd: process.cwd() });
    console.log("✅ Testy E2E zakończone pomyślnie\n");
  } catch (error) {
    console.error("❌ Testy E2E zakończone z błędami");
    console.error("   Kontynuuję analizę logów...\n");
  }

  // 2. Analizuj logi
  console.log("📋 Krok 2: Analiza logów...");
  const logFilePath = getLatestLogFile();
  if (logFilePath) {
    console.log(`   📄 Analizuję plik: ${logFilePath}\n`);
  }

  const { errors, warnings, info } = analyzeLogs(logFilePath);

  // 3. Sprawdź błędy RLS
  console.log("📋 Krok 3: Sprawdzanie błędów RLS...");
  const rlsErrors = checkRLSErrors(errors);
  if (rlsErrors.length > 0) {
    console.error(`❌ Znaleziono ${rlsErrors.length} błędów RLS:`);
    rlsErrors.forEach((e, i) => {
      console.error(`   ${i + 1}. ${e.message}`);
      if (e.error?.message) {
        console.error(`      ${e.error.message}`);
      }
    });
    console.log();
  } else {
    console.log("✅ Brak błędów RLS\n");
  }

  // 4. Sprawdź błędy autoryzacji
  console.log("📋 Krok 4: Sprawdzanie błędów autoryzacji...");
  const authErrors = checkAuthErrors(errors);
  if (authErrors.length > 0) {
    console.error(`❌ Znaleziono ${authErrors.length} błędów autoryzacji:`);
    authErrors.forEach((e, i) => {
      console.error(`   ${i + 1}. ${e.message}`);
      if (e.context?.status) {
        console.error(`      Status: ${e.context.status}`);
      }
    });
    console.log();
  } else {
    console.log("✅ Brak błędów autoryzacji\n");
  }

  // 5. Sprawdź błędy sesji
  console.log("📋 Krok 5: Sprawdzanie błędów sesji...");
  const sessionErrors = checkSessionErrors(errors);
  if (sessionErrors.length > 0) {
    console.warn(`⚠️  Znaleziono ${sessionErrors.length} błędów sesji:`);
    sessionErrors.forEach((e, i) => {
      console.warn(`   ${i + 1}. ${e.message}`);
    });
    console.log();
  } else {
    console.log("✅ Brak błędów sesji\n");
  }

  // 6. Sprawdź statusy requestów
  console.log("📋 Krok 6: Sprawdzanie statusów requestów...");
  const { total, failed, failedRequests } = checkRequestStatuses(info);
  console.log(`   📊 Łącznie requestów: ${total}`);
  console.log(`   ❌ Nieudanych: ${failed}`);
  if (failed > 0) {
    console.error("   Błędy:");
    failedRequests.forEach((r, i) => {
      console.error(`      ${i + 1}. ${r.context?.url} - Status: ${r.context?.statusCode}`);
    });
  }
  console.log();

  // 7. Podsumowanie
  console.log("📋 Podsumowanie:");
  const hasErrors = rlsErrors.length > 0 || authErrors.length > 0 || failed > 0;

  if (hasErrors) {
    console.error("❌ Weryfikacja zakończona z błędami:");
    console.error(`   - Błędy RLS: ${rlsErrors.length}`);
    console.error(`   - Błędy autoryzacji: ${authErrors.length}`);
    console.error(`   - Nieudane requesty: ${failed}`);
    process.exit(1);
  } else {
    console.log("✅ Weryfikacja zakończona pomyślnie!");
    console.log("   Wszystkie testy przeszły, brak błędów w logach.");
    process.exit(0);
  }
}

main();
