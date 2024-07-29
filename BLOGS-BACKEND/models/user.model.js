const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: 3,
    unique: true,
    required: true,
  },
  name: String,
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
  ],
});

userSchema.plugin(uniqueValidator);

userSchema.set("toJSON", {
  transform: (document, returnedObejct) => {
    returnedObejct.id = returnedObejct._id.toString();
    delete returnedObejct._id;
    delete returnedObejct.__v;
    // the passwordHash should not be revealed
    delete returnedObejct.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
