const express = require("express");
const bodyParser = require("body-parser");
const { sendEmail } = require("./service/emailService");
const { sendSms } = require("./service/smsService");

const app = express();
app.use(bodyParser.json());

// Ruta para enviar correo electrónico
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

// Ruta para enviar SMS
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
