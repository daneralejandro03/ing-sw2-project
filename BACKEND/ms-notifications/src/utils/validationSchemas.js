const Joi = require("joi");

const validationSchemas = {
  emailRequest: Joi.object({
    address: Joi.string().email().required().messages({
      "string.email": "La dirección de correo no es válida",
      "any.required": "La dirección de correo es obligatoria",
    }),
    subject: Joi.string().min(1).max(100).required().messages({
      "string.min": "El asunto debe tener al menos 1 carácter",
      "string.max": "El asunto no puede exceder los 100 caracteres",
      "any.required": "El asunto es obligatorio",
    }),
    plainText: Joi.string().min(1).required().messages({
      "string.min": "El contenido del correo debe tener al menos 1 carácter",
      "any.required": "El contenido del correo es obligatorio",
    }),
  }),

  smsRequest: Joi.object({
    to: Joi.string()
      .pattern(/^\+?[0-9]{10,15}$/)
      .required()
      .messages({
        "string.pattern.base":
          "El número de teléfono debe tener entre 10 y 15 dígitos",
        "any.required": "El número de teléfono es obligatorio",
      }),
    body: Joi.string().min(1).max(160).required().messages({
      "string.min": "El mensaje debe tener al menos 1 carácter",
      "string.max": "El mensaje no puede exceder los 160 caracteres",
      "any.required": "El contenido del mensaje es obligatorio",
    }),
  }),
};

module.exports = { validationSchemas };
