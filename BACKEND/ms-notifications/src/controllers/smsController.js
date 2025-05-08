const smsService = require("../services/smsService");
const SmsModel = require("../models/smsModel");

class SmsController {
  async sendSms(req, res, next) {
    try {
      const smsModel = SmsModel.fromRequest(req.body);

      if (!smsModel.isValid()) {
        return res.status(400).json({
          status: "error",
          message: "Faltan campos requeridos: to, body",
        });
      }

      const result = await smsService.sendSms(smsModel.toServiceFormat());

      return res.status(200).json({
        status: "success",
        message: "SMS enviado correctamente",
        data: {
          sid: result.sid,
          status: result.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SmsController();
