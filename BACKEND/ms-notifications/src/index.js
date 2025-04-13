const express = require("express");
const bodyParser = require("body-parser");
const { sendEmail } = require("./service/emailService");

const app = express();
app.use(bodyParser.json());

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
