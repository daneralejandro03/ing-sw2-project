const { validationSchemas } = require("../utils/validationSchemas");

class Validator {
  validateBody(schemaName) {
    return (req, res, next) => {
      const schema = validationSchemas[schemaName];

      if (!schema) {
        return next(
          new Error(`Esquema de validación "${schemaName}" no encontrado`)
        );
      }

      const { error, value } = schema.validate(req.body);

      if (error) {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          details: error.details.map((err) => ({
            field: err.context.key,
            message: err.message,
          })),
        });
      }

      req.body = value;
      return next();
    };
  }

  validateEmailRequest() {
    return this.validateBody("emailRequest");
  }

  validateSmsRequest() {
    return this.validateBody("smsRequest");
  }
}

module.exports = new Validator();
