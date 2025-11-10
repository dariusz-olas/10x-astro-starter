#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { updateVersion, getCurrentDate } from "./update-version.js";

const CHANGELOG_FILE = join(process.cwd(), "CHANGELOG.md");
const VERSION_FILE = join(process.cwd(), "VERSION");

function updateChangelog(commitMessage) {
  try {
    // Aktualizuj wersję najpierw
    const newVersion = updateVersion();

    // Odczytaj aktualną zawartość CHANGELOG.md
    let changelogContent = readFileSync(CHANGELOG_FILE, "utf-8");

    // Pobierz datę z wersji
    const [versionDate] = newVersion.split(".");
    const today = getCurrentDate();

    // Utwórz nowy wpis
    const newEntry = `## [${newVersion}] - ${today}\n### Changed\n- ${commitMessage || "Aktualizacja wersji"}\n\n`;

    // Znajdź miejsce po nagłówku (# Changelog i pusta linia)
    const headerEnd = changelogContent.indexOf("\n\n", changelogContent.indexOf("# Changelog"));

    if (headerEnd !== -1) {
      // Wstaw nowy wpis po nagłówku
      changelogContent =
        changelogContent.substring(0, headerEnd + 2) +
        newEntry +
        changelogContent.substring(headerEnd + 2);
    } else {
      // Jeśli nie znaleziono nagłówka, dodaj na początku
      changelogContent = newEntry + changelogContent;
    }

    // Zapisz zaktualizowany CHANGELOG
    writeFileSync(CHANGELOG_FILE, changelogContent, "utf-8");

    console.log(`Changelog updated with version ${newVersion}`);
    console.log(`Entry: ${commitMessage || "Aktualizacja wersji"}`);
  } catch (error) {
    console.error("Error updating changelog:", error);
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
