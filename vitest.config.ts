import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "tests/integration/**/*.test.ts", // Dodaj testy integracyjne
    ],
    reporters: "default",
    testTimeout: 10000, // Zwiększ timeout dla testów integracyjnych
    // Global setup dla testów integracyjnych - uruchamia serwer automatycznie
    globalSetup: ["./tests/integration/globalSetup.ts"],
  },
});
