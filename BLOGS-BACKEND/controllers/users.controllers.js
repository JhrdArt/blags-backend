const userRouter = require("express").Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");

userRouter.post("/", async (request, response) => {
  const body = request.body;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  if (!(body.username && body.password)) {
    return response
      .status(400)
      .json({ error: "Username and password are required" });
  }

  if (body.password.length <= 3 || body.username.length <= 3) {
    return response.status(400).json({
      error: "The password and username must have at least 3 characters",
    });
  }

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const existingUser = await User.findOne({ username: body.username });
  if (existingUser) {
    return response.status(400).json({ error: "Username must be unique" });
  }

  const savedUser = await user.save();
  response.json(savedUser);
});

userRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes:1,
  });
  response.json(users);
});

userRouter.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (user) {
    res.json(user.toJSON());
  } else {
    res.status(404).end();
  }
});

module.exports = userRouter;
