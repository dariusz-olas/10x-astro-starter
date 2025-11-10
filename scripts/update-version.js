#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const VERSION_FILE = join(process.cwd(), "VERSION");
const VERSION_REGEX = /^\d{4}-\d{2}-\d{2}\.\d+$/;

/**
 * Waliduje format wersji (YYYY-MM-DD.N)
 */
function validateVersionFormat(version) {
  if (!VERSION_REGEX.test(version)) {
    throw new Error(`Invalid version format: ${version}. Expected format: YYYY-MM-DD.N (e.g., 2025-11-10.1)`);
  }
  return true;
}

/**
 * Pobiera aktualną datę w formacie YYYY-MM-DD
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Aktualizuje wersję aplikacji
 * - Jeśli data się zmieniła, resetuje numer do .1
 * - Jeśli data jest taka sama, zwiększa numer o 1
 */
function updateVersion() {
  try {
    // Sprawdź czy plik VERSION istnieje
    if (!existsSync(VERSION_FILE)) {
      // Jeśli nie istnieje, utwórz z początkową wersją
      const initialVersion = `${getCurrentDate()}.1`;
      writeFileSync(VERSION_FILE, initialVersion + "\n", "utf-8");
      console.log(`Created VERSION file with initial version: ${initialVersion}`);
      return initialVersion;
    }

    // Odczytaj aktualną wersję
    let currentVersion = readFileSync(VERSION_FILE, "utf-8").trim();

    // Waliduj format aktualnej wersji
    validateVersionFormat(currentVersion);

    const today = getCurrentDate();
    const [versionDate, versionNumber] = currentVersion.split(".");

    // Waliduj numer wersji
    const parsedNumber = parseInt(versionNumber);
    if (isNaN(parsedNumber) || parsedNumber < 1) {
      throw new Error(`Invalid version number: ${versionNumber}. Must be a positive integer.`);
    }

    let newVersion;

    if (versionDate === today) {
      // Ta sama data - zwiększ numer
      const newNumber = parsedNumber + 1;
      newVersion = `${today}.${newNumber}`;
    } else {
      // Nowa data - reset do .1
      newVersion = `${today}.1`;
    }

    // Waliduj nową wersję (redundantne, ale dla pewności)
    validateVersionFormat(newVersion);

    // Zapisz nową wersję
    writeFileSync(VERSION_FILE, newVersion + "\n", "utf-8");

    console.log(`✓ Version updated: ${currentVersion} → ${newVersion}`);
    return newVersion;
  } catch (error) {
    console.error("✗ Error updating version:", error.message);
    process.exit(1);
  }
}

// Jeśli skrypt jest uruchomiony bezpośrednio
if (import.meta.url === `file://${process.argv[1]}`) {
  updateVersion();
}

export { updateVersion, getCurrentDate };
