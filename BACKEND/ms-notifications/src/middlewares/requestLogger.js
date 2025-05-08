const { config } = require("../config/environment");

module.exports = { requestLogger };

function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  console.log(
    `[${new Date().toISOString()}] ${method} ${originalUrl} - IP: ${ip}`
  );

  if (
    config.environment === "development" &&
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    const sanitizedBody = { ...req.body };

    if (sanitizedBody.password) sanitizedBody.password = "******";
    if (sanitizedBody.token) sanitizedBody.token = "******";

    console.log(
      "Cuerpo de la solicitud:",
      JSON.stringify(sanitizedBody, null, 2)
    );
  }

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    const contentLength = body ? body.length : 0;

    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} - Estado: ${
        res.statusCode
      } - Duración: ${duration}ms - Tamaño: ${contentLength} bytes`
    );

    return originalSend.call(this, body);
  };

  next();
}
