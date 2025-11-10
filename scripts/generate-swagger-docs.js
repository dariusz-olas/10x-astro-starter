import swaggerJsdoc from "swagger-jsdoc";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

try {
  const swaggerSpec = swaggerJsdoc(options);
  const outputPath = path.join(__dirname, "../public/api-docs.json");

  // Upewnij się, że katalog public istnieje
  const publicDir = path.join(__dirname, "../public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));
  console.log("✅ Swagger docs generated:", outputPath);
} catch (error) {
  console.error("❌ Error generating Swagger docs:", error);
  process.exit(1);
}

