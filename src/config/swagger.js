const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Asesor de Inversión PyME API",
      version: "1.0.0",
      description:
        "API REST que recomienda si conviene invertir en un sector/provincia para una PyME argentina, " +
        "basada en un modelo de Machine Learning (Random Forest) entrenado con datos públicos del Estado " +
        "(Registro MiPyME + variación de facturación por sector). Cada recomendación se explica en " +
        "lenguaje natural con la API de Gemini y queda guardada en el historial del usuario autenticado.",
    },
    servers: [{ url: "http://localhost:3000", description: "Servidor local" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
