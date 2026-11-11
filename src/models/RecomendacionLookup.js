const mongoose = require("mongoose");

// Tabla precalculada por ml/generar_recomendaciones.py a partir del modelo
// Random Forest entrenado con datos reales del Registro MiPyME y de
// facturacion por sector. La API solo consulta esta coleccion, no corre
// el modelo en cada request.
const recomendacionLookupSchema = new mongoose.Schema({
  categoria: { type: String, required: true },
  sector: { type: String, required: true },
  provincia: { type: String, required: true },
  regimenTributario: { type: String, required: true },
  varFactLast: { type: Number, required: true },
  varFactMean3m: { type: Number, required: true },
  muestras: { type: Number, required: true },
  indicePermanencia: { type: Number, required: true },
  nivelRiesgo: { type: String, enum: ["BAJO", "MEDIO", "ALTO"], required: true },
});

recomendacionLookupSchema.index({
  categoria: 1,
  sector: 1,
  provincia: 1,
  regimenTributario: 1,
});

module.exports = mongoose.model("RecomendacionLookup", recomendacionLookupSchema);
