const RecomendacionLookup = require("../models/RecomendacionLookup");
const Consulta = require("../models/Consulta");
const { explicarRecomendacion } = require("../services/gemini.service");

async function crearRecomendacion(req, res) {
  const { categoria, sector, provincia, regimenTributario, pregunta } = req.body;

  if (!categoria || !sector || !provincia || !regimenTributario) {
    return res.status(400).json({
      error: "categoria, sector, provincia y regimenTributario son requeridos",
    });
  }

  const match = await RecomendacionLookup.findOne({
    categoria: new RegExp(`^${categoria}$`, "i"),
    sector: new RegExp(`^${sector}$`, "i"),
    provincia: new RegExp(`^${provincia}$`, "i"),
    regimenTributario: new RegExp(`^${regimenTributario}$`, "i"),
  });

  if (!match) {
    return res.status(404).json({
      error:
        "No hay datos para esa combinación. Consultá GET /api/opciones para ver los valores válidos.",
    });
  }

  const explicacion = await explicarRecomendacion({
    categoria: match.categoria,
    sector: match.sector,
    provincia: match.provincia,
    regimenTributario: match.regimenTributario,
    indicePermanencia: match.indicePermanencia,
    nivelRiesgo: match.nivelRiesgo,
    pregunta,
  });

  const consulta = await Consulta.create({
    user: req.userId,
    categoria: match.categoria,
    sector: match.sector,
    provincia: match.provincia,
    regimenTributario: match.regimenTributario,
    indicePermanencia: match.indicePermanencia,
    nivelRiesgo: match.nivelRiesgo,
    pregunta,
    explicacion,
  });

  return res.status(201).json({
    id: consulta._id,
    categoria: consulta.categoria,
    sector: consulta.sector,
    provincia: consulta.provincia,
    regimenTributario: consulta.regimenTributario,
    indicePermanencia: consulta.indicePermanencia,
    nivelRiesgo: consulta.nivelRiesgo,
    pregunta: consulta.pregunta,
    explicacion: consulta.explicacion,
    createdAt: consulta.createdAt,
  });
}

module.exports = { crearRecomendacion };
