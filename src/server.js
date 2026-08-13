require("dotenv").config();
const app = require("./app");
const conectarDB = require("./config/db");

const PORT = process.env.PORT || 3000;

async function main() {
  await conectarDB();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Documentación en http://localhost:${PORT}/api-docs`);
  });
}

main().catch((err) => {
  console.error("No se pudo iniciar el servidor:", err);
  process.exit(1);
});
