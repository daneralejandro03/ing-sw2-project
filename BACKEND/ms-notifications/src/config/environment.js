const requiredEnvVars = [
  "EMAIL_CONNECTION_STRING",
  "EMAIL_SENDER_ADDRESS",
  "TWILIO_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_FROM",
  "PORT",
];


function validateEnvVars() {
  const missingVars = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno requeridas no definidas: ${missingVars.join(", ")}`
    );
  }

  console.log("✓ Variables de entorno validadas correctamente");
}

module.exports = {
  validateEnvVars,
  config: {
    port: process.env.PORT,
    email: {
      connectionString: process.env.EMAIL_CONNECTION_STRING,
      senderAddress: process.env.EMAIL_SENDER_ADDRESS,
    },
    twilio: {
      accountSid: process.env.TWILIO_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      fromNumber: process.env.TWILIO_FROM,
    },
    environment: process.env.NODE_ENV,
  },
};
