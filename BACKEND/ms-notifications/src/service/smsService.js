require("dotenv").config();
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

async function sendSms(to, body) {
  return client.messages.create({
    body,
    from: process.env.TWILIO_FROM,
    to,
  });
}

module.exports = { sendSms };
