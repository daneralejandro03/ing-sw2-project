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

      return res.status(200).json({
        status: "success",
        message: "Correo enviado correctamente",
        data: {
          messageId: result.messageId,
          status: result.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmailController();
