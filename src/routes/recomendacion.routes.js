const express = require("express");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { crearRecomendacion } = require("../controllers/recomendacion.controller");

const router = express.Router();

/**
 * @openapi
 * /api/recomendacion:
 *   post:
 *     summary: Obtener una recomendación de inversión para una PyME
 *     tags: [Recomendacion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoria, sector, provincia, regimenTributario]
 *             properties:
 *               categoria:
 *                 type: string
 *                 example: micro
 *               sector:
 *                 type: string
 *                 example: Agropecuario
 *               provincia:
 *                 type: string
 *                 example: BUENOS AIRES
 *               regimenTributario:
 *                 type: string
 *                 example: Monotributo
 *               pregunta:
 *                 type: string
 *                 description: Opcional. Pregunta puntual sobre la recomendación, respondida por Gemini (con topic guard).
 *                 example: ¿Por qué se considera riesgoso este sector?
 *     responses:
 *       201:
 *         description: Recomendación generada y guardada en el historial del usuario
 *       400:
 *         description: Faltan campos requeridos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: No hay datos para esa combinación (ver /api/opciones)
 */
router.post("/", requireAuth, asyncHandler(crearRecomendacion));

module.exports = router;
