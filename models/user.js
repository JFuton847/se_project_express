const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const UnauthorizedError = require("../Errors/UnauthorizedError.js");

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

userSchema.statics.findUserByCredentials = function findUserByCredentials(
  email,
  password
) {
  return this.findOne({ email })
    .select("+password") // Explicitly include the password field
    .then((user) => {
      if (!user) {
        // Use custom error for incorrect email or password
        return Promise.reject(
          new UnauthorizedError("Incorrect email or password")
        );
      }
      // Compare the provided password with the hashed password
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          // Use custom error for incorrect email or password
          return Promise.reject(
            new UnauthorizedError("Incorrect email or password")
          );
        }
        return user; // Return the user if credentials are correct
      });
    });
};

module.exports = mongoose.model("user", userSchema);
