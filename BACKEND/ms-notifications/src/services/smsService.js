const twilio = require("twilio");
const { config } = require("../config/environment");

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

class SmsService {
  async sendSms({ to, body }) {
    try {
      const formattedTo = this.formatPhoneNumber(to);

      const message = await client.messages.create({
        body,
        from: config.twilio.fromNumber,
        to: formattedTo,
      });

      return {
        sid: message.sid,
        status: message.status,
        success: true,
      };
    } catch (error) {
      console.error("Error en servicio de SMS:", error);
      throw new Error(`Error al enviar el SMS: ${error.message}`);
    }
  }

  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber.startsWith("+")) {
      return `+${phoneNumber.replace(/^\0+/, "")}`;
    }
    return phoneNumber;
  }
}

module.exports = new SmsService();
