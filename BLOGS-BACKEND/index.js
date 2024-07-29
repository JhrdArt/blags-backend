require("dotenv").config();

const app = require("./app");
const logger = require("./utils/loggers");
const config = require("./utils/config");
const http = require("http");

const server = http.createServer(app);

server.listen(config.PORT, () => {
  logger.info(`Server is running on port: ${config.PORT}`);
});
