const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  SERVER_ERROR,
  USER_NOT_FOUND,
  INVALID_ITEM_ID,
  DUPLICATE_ERROR,
  DUPLICATE_EMAIL_MESSAGE,
  AUTHENTICATION_ERROR,
  UNAUTHORIZED,
} = require("../utils/errors");

// GET /users

const getCurrentUser = (req, res) => {
  const { _id } = req.user; // Extract the logged-in user's ID from req.user

  User.findById(_id)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: USER_NOT_FOUND });
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR });
    });
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hashedPassword) => {
      return User.create({
        name,
        avatar,
        email,
        password: hashedPassword,
      });
    })
    .then((user) => {
      const { password, ...userWithoutPassword } = user.toObject();
      res.status(201).send(userWithoutPassword);
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        return res
          .status(DUPLICATE_ERROR)
          .send({ message: DUPLICATE_EMAIL_MESSAGE });
      }
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: USER_NOT_FOUND });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: INVALID_ITEM_ID });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      res.status(UNAUTHORIZED).send({ message: AUTHENTICATION_ERROR });
    });
};

const updateProfile = (req, res) => {
  const { name, avatar } = req.body;
  const { _id } = req.user; // Extract logged-in user's ID from req.user

  // Use findByIdAndUpdate to update the name and avatar fields
  User.findByIdAndUpdate(
    _id,
    { name, avatar }, // Update these fields
    { new: true, runValidators: true } // Return updated doc and run validators
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(NOT_FOUND).send({ message: USER_NOT_FOUND });
      }
      res.status(200).send(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR });
    });
};

const findUserByCredentials = (email, password) => {
  return User.findOne({ email })
    .select("+password") // Explicitly include password
    .then((user) => {
      if (!user) {
        const error = new Error("Invalid username or password.");
        error.statusCode = 401;
        throw error;
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          const error = new Error("Invalid username or password.");
          error.statusCode = 401;
          throw error;
        }
        return user;
      });
    });
};

module.exports = {
  getUsers,
  createUser,
  getUser,
  login,
  getCurrentUser,
  updateProfile,
  findUserByCredentials,
};
