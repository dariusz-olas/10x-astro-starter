#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const VERSION_FILE = join(process.cwd(), "VERSION");

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function updateVersion() {
  try {
    // Odczytaj aktualną wersję
    let currentVersion = readFileSync(VERSION_FILE, "utf-8").trim();

    const today = getCurrentDate();
    const [versionDate, versionNumber] = currentVersion.split(".");

    let newVersion;

    if (versionDate === today) {
      // Ta sama data - zwiększ numer
      const newNumber = parseInt(versionNumber) + 1;
      newVersion = `${today}.${newNumber}`;
    } else {
      // Nowa data - reset do .1
      newVersion = `${today}.1`;
    }

    // Zapisz nową wersję
    writeFileSync(VERSION_FILE, newVersion + "\n", "utf-8");

    console.log(`Version updated: ${currentVersion} -> ${newVersion}`);
    return newVersion;
  } catch (error) {
    console.error("Error updating version:", error);
    process.exit(1);
  }
}

// Jeśli skrypt jest uruchomiony bezpośrednio
if (import.meta.url === `file://${process.argv[1]}`) {
  updateVersion();
}

export { updateVersion, getCurrentDate };
