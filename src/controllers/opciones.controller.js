const RecomendacionLookup = require("../models/RecomendacionLookup");

async function listarOpciones(req, res) {
  const [categorias, sectores, provincias, regimenes] = await Promise.all([
    RecomendacionLookup.distinct("categoria"),
    RecomendacionLookup.distinct("sector"),
    RecomendacionLookup.distinct("provincia"),
    RecomendacionLookup.distinct("regimenTributario"),
  ]);

  return res.json({
    categorias: categorias.sort(),
    sectores: sectores.sort(),
    provincias: provincias.sort(),
    regimenesTributarios: regimenes.sort(),
  });
}

module.exports = { listarOpciones };
