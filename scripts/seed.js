require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const conectarDB = require("../src/config/db");
const RecomendacionLookup = require("../src/models/RecomendacionLookup");

const RUTA_JSON = path.join(__dirname, "..", "ml", "recomendaciones.json");

async function main() {
  if (!fs.existsSync(RUTA_JSON)) {
    console.error(
      `No se encontró ${RUTA_JSON}. Corré primero: python3 ml/generar_recomendaciones.py`
    );
    process.exit(1);
  }

  const registros = JSON.parse(fs.readFileSync(RUTA_JSON, "utf-8"));

  await conectarDB();

  await RecomendacionLookup.deleteMany({});
  await RecomendacionLookup.insertMany(registros);

  console.log(`Cargadas ${registros.length} combinaciones en RecomendacionLookup`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
