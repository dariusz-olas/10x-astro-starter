import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      // Testy integracyjne są wyłączone w CI/CD - wymagają uruchomionego serwera
      // Uruchom lokalnie: VITEST_INTEGRATION=true npm test
      ...(process.env.VITEST_INTEGRATION === "true" ? ["tests/integration/**/*.test.ts"] : []),
    ],
    reporters: "default",
    testTimeout: 10000, // Zwiększ timeout dla testów integracyjnych
    // Global setup tylko dla testów integracyjnych
    // Dla testów jednostkowych (src/**/*.test.ts) nie jest potrzebny
    globalSetup: process.env.VITEST_INTEGRATION === "true" ? ["./tests/integration/globalSetup.ts"] : undefined,
  },
});
