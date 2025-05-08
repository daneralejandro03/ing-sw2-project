const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./config/swagger");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");
const { requestLogger } = require("./middlewares/requestLogger");
const { validateEnvVars } = require("./config/environment");

validateEnvVars();

const app = express();

app.use(bodyParser.json());
app.use(requestLogger);

app.use("/api/v1", routes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

app.use(errorHandler);

module.exports = app;
