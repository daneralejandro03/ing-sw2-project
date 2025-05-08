const express = require("express");
const router = express.Router();
const emailRoutes = require("./emailRoutes");
const smsRoutes = require("./smsRoutes");

/**
 * @swagger
 * tags:
 *   - name: Email
 *     description: Operaciones relacionadas con correos electrónicos
 *   - name: SMS
 *     description: Operaciones relacionadas con mensajes SMS
 */

// Rutas para email
router.use("/email", emailRoutes);

// Rutas para SMS
router.use("/sms", smsRoutes);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Verificar estado de la API
 *     description: Endpoint para verificar que la API está funcionando
 *     responses:
 *       200:
 *         description: API en funcionamiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: API de comunicación funcionando correctamente
 */
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API de comunicación funcionando correctamente",
    version: "1.0.0",
  });
});

module.exports = router;
