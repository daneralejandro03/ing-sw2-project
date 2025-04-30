require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { sendEmail } = require("./service/emailService");
const { sendSms } = require("./service/smsService");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT;

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Servicio de Comunicación SMS y Email",
    version: "1.0",
    description:
      "API para enviar SMS con Twilio y correos con Azure Communication Services",
  },
  servers: [{ url: `http://localhost:${PORT}`, description: "Servidor local" }],
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "index.js")],
};

const swaggerSpec = swaggerJsdoc(options);
console.log("Endpoints detectados:", Object.keys(swaggerSpec.paths));

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailRequest:
 *       type: object
 *       required:
 *         - address
 *         - subject
 *         - plainText
 *       properties:
 *         address:
 *           type: string
 *           format: email
 *         subject:
 *           type: string
 *         plainText:
 *           type: string
 *     SmsRequest:
 *       type: object
 *       required:
 *         - to
 *         - body
 *       properties:
 *         to:
 *           type: string
 *         body:
 *           type: string
 */

/**
 * @swagger
 * /send-email:
 *   post:
 *     summary: Envía un correo electrónico
 *     tags:
 *       - Email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailRequest'
 *     responses:
 *       '200':
 *         description: Correo enviado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 status:
 *                   type: string
 *       '400':
 *         description: Faltan campos requeridos
 *       '500':
 *         description: Error al enviar el correo
 */
app.post("/send-email", async (req, res) => {
  const { address, subject, plainText } = req.body;
  if (!address || !subject || !plainText) {
    return res
      .status(400)
      .json({ error: "Faltan campos requeridos: address, subject, plainText" });
  }
  try {
    const result = await sendEmail(address, subject, plainText);
    res.status(200).json({ message: "Correo enviado", status: result.status });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ error: "Error al enviar el correo" });
  }
});

/**
 * @swagger
 * /send-sms:
 *   post:
 *     summary: Envía un SMS
 *     tags:
 *       - SMS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SmsRequest'
 *     responses:
 *       '200':
 *         description: SMS enviado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sid:
 *                   type: string
 *                 status:
 *                   type: string
 *       '400':
 *         description: Faltan campos requeridos
 *       '500':
 *         description: Error al enviar el SMS
 */
app.post("/send-sms", async (req, res) => {
  const { to, body } = req.body;
  if (!to || !body) {
    return res.status(400).json({ error: "Faltan campos: to, body" });
  }
  try {
    const message = await sendSms(to, body);
    res.status(200).json({
      message: "SMS enviado",
      sid: message.sid,
      status: message.status,
    });
  } catch (error) {
    console.error("Error al enviar SMS:", error);
    res.status(500).json({ error: "Error al enviar el SMS" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
