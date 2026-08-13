const express = require("express");
const { listarOpciones } = require("../controllers/opciones.controller");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

/**
 * @openapi
 * /api/opciones:
 *   get:
 *     summary: Listar los valores válidos de categoría, sector, provincia y régimen tributario
 *     tags: [Opciones]
 *     security: []
 *     responses:
 *       200:
 *         description: Valores válidos para usar en POST /api/recomendacion
 */
router.get("/", asyncHandler(listarOpciones));

module.exports = router;
