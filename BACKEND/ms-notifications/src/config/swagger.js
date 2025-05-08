const swaggerJsdoc = require("swagger-jsdoc");
const { config } = require("./environment");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "API de Comunicación",
    version: "1.0.0",
    description:
      "API para enviar SMS con Twilio y correos con Azure Communication Services",
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: "Servidor de desarrollo",
    },
  ],
  components: {
    schemas: {
      EmailRequest: {
        type: "object",
        required: ["address", "subject", "plainText"],
        properties: {
          address: {
            type: "string",
            format: "email",
            description: "Dirección de correo del destinatario",
          },
          subject: {
            type: "string",
            description: "Asunto del correo",
          },
          plainText: {
            type: "string",
            description: "Contenido del correo en texto plano",
          },
        },
      },
      SmsRequest: {
        type: "object",
        required: ["to", "body"],
        properties: {
          to: {
            type: "string",
            description: "Número de teléfono del destinatario",
          },
          body: {
            type: "string",
            description: "Contenido del mensaje SMS",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          status: {
            type: "integer",
          },
          message: {
            type: "string",
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Solicitud incorrecta",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
      InternalError: {
        description: "Error interno del servidor",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
            },
          },
        },
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
};
