const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");

const logger = require("./utils/loggers");
const config = require("./utils/config");

const blogRouter = require("./controllers/blogs.controllers");
const userRouter = require("./controllers/users.controllers");
const loginRouter = require("./controllers/login.controllers");

const tokenExtractor = require("./utils/middleware").tokenExtractor;
const userExtractor = require("./utils/middleware").userExtractor;
const requestLogger = require("./utils/middleware").requestLogger;
const unknownEndpoint = require("./utils/middleware").unknownEndpoint;
const errorHandler = require("./utils/middleware").errorhandler;

require("express-async-errors");

const connnectToMONGODB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    logger.info("Connected to MONGODB");
  } catch (error) {
    logger.error(`Error connecting to MONGODB ${error.message}`);
  }
};

connnectToMONGODB();

app.use(cors());
app.use(express.json());

app.use(requestLogger);
app.use(tokenExtractor);

app.use("/api/blogs", userExtractor, blogRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing.controllers");
  app.use("/api/testing", testingRouter);
}

app.use(unknownEndpoint);
app.use(errorHandler);
module.exports = app;
