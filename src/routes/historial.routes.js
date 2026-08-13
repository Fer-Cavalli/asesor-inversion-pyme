const express = require("express");
const requireAuth = require("../middleware/auth");
const asyncHandler = require("../middleware/asyncHandler");
const { listarHistorial, obtenerConsulta } = require("../controllers/historial.controller");

const router = express.Router();

/**
 * @openapi
 * /api/historial:
 *   get:
 *     summary: Listar el historial de recomendaciones del usuario autenticado
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de consultas pasadas, más reciente primero
 *       401:
 *         description: No autenticado
 */
router.get("/", requireAuth, asyncHandler(listarHistorial));

/**
 * @openapi
 * /api/historial/{id}:
 *   get:
 *     summary: Obtener una consulta puntual del historial del usuario autenticado
 *     tags: [Historial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: La consulta encontrada
 *       404:
 *         description: No existe esa consulta para este usuario
 */
router.get("/:id", requireAuth, asyncHandler(obtenerConsulta));

module.exports = router;
