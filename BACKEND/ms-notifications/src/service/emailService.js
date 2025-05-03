require("dotenv").config();
const { EmailClient } = require("@azure/communication-email");
const fs = require("fs");
const path = require("path");

// Verificación de variables de entorno
const requiredEnvVars = [
  "EMAIL_CONNECTION_STRING",
  "EMAIL_SENDER_ADDRESS",
  "TWILIO_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM"
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
});

const connectionString = process.env.EMAIL_CONNECTION_STRING;
const client = new EmailClient(connectionString);

const templatePath = path.join(__dirname, "../html/emailTemplate.html");
const emailTemplate = fs.readFileSync(templatePath, { encoding: "utf8" });

// Función para crear el cuerpo del email con el template
function createHtmlTemplate(subject, plainText) {
  return emailTemplate
    .replace("{{subject}}", subject)
    .replace("{{plainText}}", plainText);
}

// Función para enviar el email
async function sendEmail(address, subject, plainText) {
  const html = createHtmlTemplate(subject, plainText);
  const emailMessage = {
    senderAddress: process.env.EMAIL_SENDER_ADDRESS,
    content: {
      subject,
      plainText,
      html,
    },
    recipients: {
      to: [{ address }],
    },
  };

  const poller = await client.beginSend(emailMessage);
  const result = await poller.pollUntilDone();
  return result;
}

module.exports = { sendEmail };
