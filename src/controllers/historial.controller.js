const mongoose = require("mongoose");
const Consulta = require("../models/Consulta");

async function listarHistorial(req, res) {
  const consultas = await Consulta.find({ user: req.userId }).sort({ createdAt: -1 });
  return res.json(consultas);
}

async function obtenerConsulta(req, res) {
  // Un id mal formado haría fallar a Mongoose con un CastError (500): es un 404.
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: "Consulta no encontrada" });
  }

  const consulta = await Consulta.findOne({ _id: req.params.id, user: req.userId });

  if (!consulta) {
    return res.status(404).json({ error: "Consulta no encontrada" });
  }

  return res.json(consulta);
}

module.exports = { listarHistorial, obtenerConsulta };
