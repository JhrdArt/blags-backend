require("dotenv").config();
const User = require("../models/user.model");
const logger = require("./loggers");
const jwt = require("jsonwebtoken");

//MIDDLEWARE ENDPOINT
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "Unknow endpoint" });
};
//MIDDLEWARE
const requestLogger = (request, respone, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};
//MIDDLEWARE ERRORHANDLER
const errorhandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "Invalid token" });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({ error: "Token expired" });
  }
  next(error);
};

const tokenExtractor = (request, response, next) => {
  const authorization = request.get("authorization");
  console.log(authorization);
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    request.token = authorization.substring(7);
  } else {
    request.token = null;
  }
  next();
};

const userExtractor = async (request, response, next) => {
  const token = request.token;
  if (token) {
    const decodeToken = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decodeToken.id);
    request.user = user;
  } else {
    request.user = null;
  }

  next();
};

// const userExtractor = async (request, response, next) => {
//   const { username, id } = request.body;
//   try {
//     const user = await User.findOne({ username });
//     console.log("user: ", username);

//     if (user) {
//       request.user = user;
//     } else {
//       return response.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     return response.status(500).json({ error: "Internal server error" });
//   }

//   next();
// };

module.exports = {
  unknownEndpoint,
  requestLogger,
  errorhandler,
  tokenExtractor,
  userExtractor,
};
