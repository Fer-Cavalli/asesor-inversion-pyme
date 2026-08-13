const express = require("express");
const { register, login } = require("../controllers/auth.controller");
const asyncHandler = require("../middleware/asyncHandler");

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: qa@bracketmedia.com
 *               password:
 *                 type: string
 *                 example: unaPassword123
 *     responses:
 *       201:
 *         description: Usuario creado
 *       409:
 *         description: El email ya está registrado
 */
router.post("/register", asyncHandler(register));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener un JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, devuelve el token JWT
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", asyncHandler(login));

module.exports = router;
