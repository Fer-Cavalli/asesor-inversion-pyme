const mongoose = require("mongoose");

const consultaSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categoria: { type: String, required: true },
    sector: { type: String, required: true },
    provincia: { type: String, required: true },
    regimenTributario: { type: String, required: true },
    probExito: { type: Number, required: true },
    riesgo: { type: Number, required: true },
    recomendacion: { type: String, required: true },
    pregunta: { type: String },
    explicacion: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consulta", consultaSchema);
