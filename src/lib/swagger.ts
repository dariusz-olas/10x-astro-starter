import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
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
        url: "https://your-app.pages.dev",
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
  apis: ["./src/pages/api/**/*.ts"], // Ścieżki do plików z JSDoc
};

export const swaggerSpec = swaggerJsdoc(options);
