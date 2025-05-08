// src/routes/emailRoutes.js
const express = require("express");
const router = express.Router();
const emailController = require("../controllers/emailController");
const validator = require("../middlewares/validator");
const { asyncHandler } = require("../middlewares/errorHandler");

/**
 * @swagger
 * /email/send:
 *   post:
 *     summary: Envía un correo electrónico
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       200:
 *         description: Correo enviado con éxito
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
 *                   example: Correo enviado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                     status:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  "/send",
  validator.validateEmailRequest(),
  asyncHandler(emailController.sendEmail)
);

module.exports = router;
