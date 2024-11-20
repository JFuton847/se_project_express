const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    minlength: [2, "Name must be at least 2 characters long."],
    maxlength: [30, "Name cannot be longer than 30 characters."],
  },
  avatar: {
    type: String,
    required: [true, "The avatar field is required."],
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
    },
  },
  email: {
    type: String,
    required: [true, "Email address is required."],
    unique: true,
    validate: {
      validator(value) {
        return validator.isEmail(value);
      },
      message: "Invalid email format.",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    select: false,
  },
});

module.exports = mongoose.model("user", userSchema);
