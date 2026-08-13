const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");
const authRoutes = require("./routes/auth.routes");
const recomendacionRoutes = require("./routes/recomendacion.routes");
const historialRoutes = require("./routes/historial.routes");
const opcionesRoutes = require("./routes/opciones.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.json({ mensaje: "Asesor de Inversión PyME API — documentación en /api-docs" });
});

app.use("/api/auth", authRoutes);
app.use("/api/recomendacion", recomendacionRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/opciones", opcionesRoutes);

app.use(errorHandler);

module.exports = app;
