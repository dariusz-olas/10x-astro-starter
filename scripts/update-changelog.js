#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { updateVersion, getCurrentDate } from "./update-version.js";

const CHANGELOG_FILE = join(process.cwd(), "CHANGELOG.md");
const VERSION_FILE = join(process.cwd(), "VERSION");

/**
 * Sanityzuje commit message przed zapisem do CHANGELOG
 * - Usuwa HTML tags
 * - Escapuje znaki specjalne Markdown
 * - Trim whitespace
 */
function sanitizeCommitMessage(message) {
  if (!message || typeof message !== "string") {
    return "Aktualizacja wersji";
  }

  let sanitized = message.trim();

  // Usuń HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, "");

  // Escapuj znaki specjalne Markdown (ale zachowaj podstawowe formatowanie)
  // Escapujemy tylko potencjalnie niebezpieczne znaki
  sanitized = sanitized
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Usuń linki [text](url) → text
    .replace(/`{3,}/g, "```") // Ogranicz code blocks
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Usuń script tags (dodatkowa ochrona)
    .replace(/javascript:/gi, "") // Usuń javascript: protocol
    .replace(/on\w+\s*=/gi, ""); // Usuń event handlers (onclick=, onerror=, etc.)

  // Usuń wielokrotne spacje/newlines
  sanitized = sanitized.replace(/\s+/g, " ").trim();

  return sanitized;
}

/**
 * Waliduje commit message
 */
function validateCommitMessage(message) {
  if (!message || typeof message !== "string") {
    return false;
  }
  // Sprawdź czy nie jest zbyt długa (max 500 znaków)
  if (message.length > 500) {
    throw new Error("Commit message is too long (max 500 characters)");
  }
  return true;
}

/**
 * Aktualizuje CHANGELOG.md z nową wersją i commit message
 * @param {string} commitMessage - Opis zmian
 */
function updateChangelog(commitMessage) {
  try {
    // Sanityzuj i waliduj commit message
    const sanitizedMessage = sanitizeCommitMessage(commitMessage || "Aktualizacja wersji");
    validateCommitMessage(sanitizedMessage);

    // Aktualizuj wersję najpierw
    const newVersion = updateVersion();

    // Sprawdź czy CHANGELOG.md istnieje
    if (!existsSync(CHANGELOG_FILE)) {
      console.warn(`⚠ CHANGELOG.md does not exist. Creating new file.`);
      const initialChangelog = `# Changelog

Wszystkie znaczące zmiany w projekcie będą dokumentowane w tym pliku.

Format oparty na [Keep a Changelog](https://keepachangelog.com/pl/1.0.0/),
i ten projekt adheres to [Semantic Versioning](https://semver.org/lang/pl/).

`;
      writeFileSync(CHANGELOG_FILE, initialChangelog, "utf-8");
    }

    // Odczytaj aktualną zawartość CHANGELOG.md
    let changelogContent = readFileSync(CHANGELOG_FILE, "utf-8");

    // Pobierz datę z wersji
    const [versionDate] = newVersion.split(".");
    const today = getCurrentDate();

    // Utwórz nowy wpis
    const newEntry = `## [${newVersion}] - ${today}\n### Changed\n- ${sanitizedMessage}\n\n`;

    // Znajdź miejsce po nagłówku (# Changelog i pusta linia)
    const headerMatch = changelogContent.indexOf("# Changelog");

    if (headerMatch === -1) {
      console.warn("⚠ CHANGELOG.md doesn't have standard header. Adding entry at the top.");
      changelogContent = newEntry + changelogContent;
    } else {
      // Znajdź koniec nagłówka (pierwsze podwójne newline po "# Changelog")
      const headerEnd = changelogContent.indexOf("\n\n", headerMatch);

      if (headerEnd !== -1) {
        // Wstaw nowy wpis po nagłówku
        changelogContent =
          changelogContent.substring(0, headerEnd + 2) + newEntry + changelogContent.substring(headerEnd + 2);
      } else {
        // Jeśli nie znaleziono podwójnego newline, dodaj na końcu pliku
        changelogContent = changelogContent + "\n\n" + newEntry;
      }
    }

    // Zapisz zaktualizowany CHANGELOG
    writeFileSync(CHANGELOG_FILE, changelogContent, "utf-8");

    console.log(`✓ Changelog updated with version ${newVersion}`);
    console.log(`✓ Entry: ${sanitizedMessage}`);
  } catch (error) {
    console.error("✗ Error updating changelog:", error.message);
    process.exit(1);
  }
}

// Pobierz commit message z argumentów
const commitMessage = process.argv[2] || "Aktualizacja wersji";

// Jeśli skrypt jest uruchomiony bezpośrednio
if (import.meta.url === `file://${process.argv[1]}`) {
  updateChangelog(commitMessage);
}

export { updateChangelog };
