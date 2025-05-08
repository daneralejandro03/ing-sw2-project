// src/routes/smsRoutes.js
const express = require("express");
const router = express.Router();
const smsController = require("../controllers/smsController");
const validator = require("../middlewares/validator");
const { asyncHandler } = require("../middlewares/errorHandler");

/**
 * @swagger
 * /sms/send:
 *   post:
 *     summary: Envía un mensaje SMS
 *     tags: [SMS]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SmsRequest'
 *     responses:
 *       200:
 *         description: SMS enviado con éxito
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
 *                   example: SMS enviado correctamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     sid:
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
  validator.validateSmsRequest(),
  asyncHandler(smsController.sendSms)
);

module.exports = router;
