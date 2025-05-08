const { config } = require("../config/environment");

function errorHandler(err, req, res, next) {
  if (config.environment === "development") {
    console.error("Error completo:", err);
  } else {
    console.error("Error:", err.message);
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Error interno del servidor"
      : err.message || "Ocurrió un error";

  const errorResponse = {
    status: "error",
    message,
  };

  if (config.environment === "development") {
    errorResponse.stack = err.stack;
    if (err.details) {
      errorResponse.details = err.details;
    }
  }

  res.status(statusCode).json(errorResponse);
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};
