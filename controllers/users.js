const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const InternalServerError = require("../Errors/InternalServerError");
const NotFoundError = require("../Errors/NotFoundError");
const DuplicateError = require("../Errors/DuplicateError");
const BadRequestError = require("../Errors/BadRequestError");

const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  SERVER_ERROR,
  USER_NOT_FOUND,
  DUPLICATE_ERROR,
  DUPLICATE_EMAIL_MESSAGE,
  AUTHENTICATION_ERROR,
  UNAUTHORIZED,
} = require("../utils/errors");

// GET /users

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user; // Extract the logged-in user's ID from req.user

  User.findById(_id)
    .then((data) => {
      if (!data) {
        throw new NotFoundError("User not found");
      }
      const user = {
        _id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      };
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  // if (!email || !password) {
  //   return res
  //     .status(BAD_REQUEST)
  //     .send({ message: "Email and password are required." });
  // }

  User.findOne({ email }) // Check if a user with the given email exists
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(DUPLICATE_ERROR)
          .send({ message: "Email already exists." }); // Handle duplicate email
      }

      return bcrypt.hash(password, 10);
    })
    .then((hashedPassword) =>
      User.create({
        name,
        avatar,
        email,
        password: hashedPassword,
      })
    )
    .then((user) => {
      const userObject = user.toObject();
      delete userObject.password;
      return res.status(201).send(userObject);
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        return next(new DuplicateError("Duplicate email"));
      }
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Validation error"));
      }
      return next(err);
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password are required." });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(UNAUTHORIZED).send({ message: AUTHENTICATION_ERROR });
    });
};

const updateProfile = (req, res, next) => {
  const { name, avatar } = req.body;
  const { _id } = req.user; // Extract logged-in user's ID from req.user

  // Use findByIdAndUpdate to update the name and avatar fields
  User.findByIdAndUpdate(
    _id,
    { name, avatar }, // Update these fields
    { new: true, runValidators: true } // Return updated doc and run validators
  )
    .then((data) => {
      const updatedUser = {
        _id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      };
      if (!updatedUser) {
        throw new NotFoundError("User not updated");
      }
      return res.status(200).send(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return next(err);
    });
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateProfile,
};
