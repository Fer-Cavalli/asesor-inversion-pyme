const mongoose = require("mongoose");

async function conectarDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Falta la variable de entorno MONGODB_URI");
  }

  await mongoose.connect(uri);
  console.log("MongoDB conectado");
}

module.exports = conectarDB;
