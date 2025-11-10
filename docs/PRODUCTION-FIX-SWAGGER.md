# Naprawa błędów 500 na produkcji - Problem z swagger-jsdoc

## 🔴 Problem

Aplikacja zwraca błędy 500 na produkcji (Cloudflare Pages). Główna przyczyna:

**`swagger-jsdoc` nie jest kompatybilny z Cloudflare Edge Runtime**

Biblioteka `swagger-jsdoc` używa Node.js APIs (`fs.readFileSync`, `path`, etc.), które nie są dostępne w Cloudflare Workers/Edge Runtime.

## 🔧 Rozwiązanie

### Opcja 1: Generowanie dokumentacji w build time (ZALECANE)

Zamiast generować dokumentację w runtime, wygeneruj ją podczas builda i zapisz jako statyczny plik JSON.

**Krok 1: Utwórz skrypt do generowania dokumentacji**

**Plik:** `scripts/generate-swagger-docs.js`

```javascript
const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "10xCards API",
      version: "1.0.0",
      description: "API dla aplikacji do nauki fiszek edukacyjnych",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:4321",
        description: "Development server",
      },
      {
        url: "https://10x-astro-starter-dqx.pages.dev",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/pages/api/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
const outputPath = path.join(__dirname, "../public/api-docs.json");

fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
console.log("✅ Swagger docs generated:", outputPath);
```

**Krok 2: Dodaj skrypt do package.json**

```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-swagger-docs.js",
    "build": "npm run docs:generate && astro build"
  }
}
```

**Krok 3: Zmień endpoint `/api/docs`**

**Plik:** `src/pages/api/docs.ts`

```typescript
import type { APIRoute } from "astro";
import apiDocsJson from "../../../public/api-docs.json?raw";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const swaggerSpec = JSON.parse(apiDocsJson);
    return new Response(JSON.stringify(swaggerSpec, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to load API documentation" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
```

**Krok 4: Usuń import z `src/lib/swagger.ts`**

Usuń lub zmień `src/lib/swagger.ts` - nie jest już potrzebny w runtime.

---

### Opcja 2: Wyłączenie endpointu `/api/docs` w produkcji (SZYBKA NAPRAWA)

Jeśli chcesz szybko naprawić błędy 500, możesz wyłączyć endpoint dokumentacji w produkcji:

**Plik:** `src/pages/api/docs.ts`

```typescript
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async () => {
  // W Cloudflare Edge Runtime, swagger-jsdoc nie działa
  // Zwróć informację o lokalizacji dokumentacji
  return new Response(
    JSON.stringify({
      message: "API documentation is available in the repository",
      location: "https://github.com/your-repo/blob/main/docs/API.md",
      note: "Swagger docs generation requires Node.js APIs not available in Edge Runtime",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
```

---

### Opcja 3: Użycie alternatywnej biblioteki (DŁUGOTERMINOWE)

Można użyć biblioteki kompatybilnej z Edge Runtime lub napisać własny parser JSDoc.

---

## 🎯 Rekomendacja

**Opcja 1 (Generowanie w build time)** jest najlepsza, bo:
- ✅ Działa w Cloudflare Edge Runtime
- ✅ Szybsze (dokumentacja jest statyczna)
- ✅ Nie wymaga Node.js APIs w runtime
- ✅ Można cache'ować w CDN

---

## 📋 Checklist naprawy

1. [ ] Utworzyć `scripts/generate-swagger-docs.js`
2. [ ] Dodać `npm run docs:generate` do `package.json`
3. [ ] Zmienić `src/pages/api/docs.ts` aby używał statycznego JSON
4. [ ] Dodać `public/api-docs.json` do `.gitignore` (opcjonalnie)
5. [ ] Zaktualizować `astro.config.mjs` jeśli potrzeba
6. [ ] Przetestować lokalnie: `npm run docs:generate && npm run build`
7. [ ] Wypushować i zredeployować

---

## ⚠️ Uwaga

Po naprawie, upewnij się że:
- ✅ Wszystkie zmienne środowiskowe są ustawione w Cloudflare Pages
- ✅ URL produkcyjny jest dodany do Supabase Redirect URLs
- ✅ Build przechodzi bez błędów

