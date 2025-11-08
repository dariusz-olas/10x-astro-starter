#!/usr/bin/env node

/**
 * Skrypt pomocniczy do weryfikacji logów po wykonaniu testów E2E
 * Uruchom: node scripts/verify-logs-after-tests.js
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const logsDir = join(process.cwd(), "logs");
const today = new Date().toISOString().split("T")[0];
const appLogFile = join(logsDir, `app-${today}.log`);
const errorLogFile = join(logsDir, `error-${today}.log`);

function readLogFile(filePath) {
  if (!existsSync(filePath)) {
    return [];
  }
  try {
    const content = readFileSync(filePath, "utf-8");
    return content.split("\n").filter((line) => line.trim().length > 0);
  } catch (error) {
    console.error(`Błąd odczytu pliku ${filePath}:`, error.message);
    return [];
  }
}

function parseLogLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

function analyzeLogs() {
  console.log("\n=== ANALIZA LOGÓW PO TESTACH ===\n");

  const appLogLines = readLogFile(appLogFile);
  const errorLogLines = readLogFile(errorLogFile);

  if (appLogLines.length === 0) {
    console.log("⚠️  Brak logów aplikacji - czy testy zostały wykonane?");
    return;
  }

  const appLogs = appLogLines.map(parseLogLine).filter((log) => log !== null);
  const errorLogs = errorLogLines.map(parseLogLine).filter((log) => log !== null);

  // 1. Statystyki ogólne
  console.log("📊 Statystyki:");
  console.log(`   - Całkowita liczba logów: ${appLogs.length}`);
  console.log(`   - Błędy (ERROR): ${errorLogs.length}`);
  const warnings = appLogs.filter((log) => log.level === "WARNING");
  console.log(`   - Ostrzeżenia (WARNING): ${warnings.length}`);

  // 2. Sprawdź requesty API
  const apiLogs = appLogs.filter((log) => log.component && log.component.startsWith("/api/"));
  console.log(`   - Requesty API: ${apiLogs.length}`);

  // 3. Sprawdź autoryzację
  const reviewLogs = apiLogs.filter((log) => log.component.includes("/api/review/"));
  const reviewWithAuth = reviewLogs.filter(
    (log) => log.context && log.context.headers && log.context.headers.authorization
  );
  const reviewWithoutAuth = reviewLogs.filter(
    (log) => !log.context || !log.context.headers || !log.context.headers.authorization
  );

  console.log("\n🔐 Autoryzacja:");
  console.log(`   - Requesty do /api/review/*: ${reviewLogs.length}`);
  console.log(`   ✅ Z nagłówkiem Authorization: ${reviewWithAuth.length}`);
  console.log(`   ❌ Bez nagłówka Authorization: ${reviewWithoutAuth.length}`);

  if (reviewWithoutAuth.length > 0) {
    console.log("\n⚠️  UWAGA: Znaleziono requesty bez nagłówka Authorization!");
    reviewWithoutAuth.forEach((log) => {
      console.log(`   - ${log.component} (${log.timestamp})`);
    });
  }

  // 4. Sprawdź statusy odpowiedzi
  const completedLogs = apiLogs.filter(
    (log) => log.message === "API request completed" && log.context && log.context.statusCode
  );
  const successLogs = completedLogs.filter((log) => log.context.statusCode === 200);
  const failedLogs = completedLogs.filter((log) => log.context.statusCode >= 400);

  console.log("\n📈 Statusy odpowiedzi:");
  console.log(`   - Sukces (200): ${successLogs.length}`);
  console.log(`   - Błędy (>=400): ${failedLogs.length}`);

  if (failedLogs.length > 0) {
    console.log("\n⚠️  UWAGA: Znaleziono requesty z błędami!");
    failedLogs.forEach((log) => {
      console.log(`   - ${log.component}: ${log.context.statusCode} (${log.timestamp})`);
    });
  }

  // 5. Sprawdź spójność requestId
  const requestGroups = {};
  apiLogs.forEach((log) => {
    if (log.requestId) {
      if (!requestGroups[log.requestId]) {
        requestGroups[log.requestId] = [];
      }
      requestGroups[log.requestId].push(log);
    }
  });

  console.log("\n🔗 Spójność requestId:");
  console.log(`   - Unikalne requestId: ${Object.keys(requestGroups).length}`);
  const incompleteRequests = Object.keys(requestGroups).filter(
    (id) => requestGroups[id].length < 2
  );
  if (incompleteRequests.length > 0) {
    console.log(`   ⚠️  Requesty bez logów start/end: ${incompleteRequests.length}`);
  } else {
    console.log(`   ✅ Wszystkie requesty mają logi start i end`);
  }

  // 6. Podsumowanie
  console.log("\n" + "=".repeat(50));
  const hasIssues =
    reviewWithoutAuth.length > 0 || failedLogs.length > 0 || errorLogs.length > 0;
  if (hasIssues) {
    console.log("❌ Znaleziono problemy w logach!");
    process.exit(1);
  } else {
    console.log("✅ Wszystkie testy przeszły pomyślnie!");
    process.exit(0);
  }
}

analyzeLogs();

