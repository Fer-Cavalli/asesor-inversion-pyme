const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Asesor de Inversión PyME API",
      version: "1.0.0",
      description:
        "API REST que ayuda a evaluar el riesgo de invertir en una PyME argentina según su sector, provincia, " +
        "categoría y régimen tributario. Usa un modelo de Machine Learning (Random Forest) entrenado con datos " +
        "públicos del Estado (Registro MiPyME + variación de facturación por sector) que estima la permanencia " +
        "de empresas con ese perfil en el registro (no mide rentabilidad). Cada resultado se explica en " +
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
