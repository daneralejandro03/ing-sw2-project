const emailService = require("../services/emailService");
const EmailModel = require("../models/emailModel");

class EmailController {
  async sendEmail(req, res, next) {
    try {
      const emailModel = EmailModel.fromRequest(req.body);

      if (!emailModel.isValid()) {
        return res.status(400).json({
          status: "error",
          message: "Faltan campos requeridos: address, subject, plainText",
        });
      }

      const result = await emailService.sendEmail(emailModel.toServiceFormat());

      if (result.success) {
        return res.status(200).json({
          status: "success",
          message: "Correo enviado correctamente",
          data: {
            messageId: result.messageId,
            status: result.status,
          },
        });
      } else if (result.status === "suppressed") {
        return res.status(200).json({
          status: "warning",
          message: result.reason,
          data: {
            address: emailModel.address,
            status: result.status,
          },
        });
      } else {
        return res.status(500).json({
          status: "error",
          message: "Error interno del servidor",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmailController();
