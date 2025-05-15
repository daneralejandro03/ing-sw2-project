const { EmailClient } = require("@azure/communication-email");
const fs = require("fs");
const path = require("path");
const { config } = require("../config/environment");

const client = new EmailClient(config.email.connectionString);

const templatePath = path.join(
  __dirname,
  "../../src/templates/html/emailTemplate.html"
);
const emailTemplate = fs.readFileSync(templatePath, { encoding: "utf8" });

class EmailService {
  createHtmlTemplate(subject, plainText) {
    return emailTemplate
      .replace("{{subject}}", subject)
      .replace("{{plainText}}", plainText.replace(/\n/g, "<br/>"));
  }

  async sendEmail({ address, subject, plainText }) {
    try {
      const html = this.createHtmlTemplate(subject, plainText);

      const emailMessage = {
        senderAddress: config.email.senderAddress,
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

      return {
        status: result.status,
        messageId: result.id,
        success: true,
      };
    } catch (error) {
      console.error("Error en servicio de email:", error);

      // Manejo específico para EmailDroppedAllRecipientsSuppressed
      if (
        error.code === "EmailDroppedAllRecipientsSuppressed" ||
        error.message.includes("EmailDroppedAllRecipientsSuppressed")
      ) {
        return {
          status: "suppressed",
          messageId: null,
          success: false,
          reason:
            "El destinatario está en la lista de supresión y el correo no fue enviado.",
        };
      }

      throw new Error(`Error al enviar el correo: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
