const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
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
    .then((data) => {
      const user = {
        _id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      };
      if (!user) {
        return res.status(NOT_FOUND).send({ message: USER_NOT_FOUND });
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR });
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

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "Email and password are required." });
  }

  User.findOne({ email }) // Check if a user with the given email exists
    .then((existingUser) => {
      if (existingUser) {
        return res
          .status(DUPLICATE_ERROR)
          .send({ message: "Email already exists." }); // Handle duplicate email
      }

      return bcrypt
        .hash(password, 10)
        .then((hashedPassword) =>
          User.create({
            name,
            avatar,
            email,
            password: hashedPassword,
          })
        )
        .then((user) => {
          const { password: UserPassword, ...userWithoutPassword } =
            user.toObject();
          return res.status(201).send(userWithoutPassword);
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
          return res
            .status(INTERNAL_SERVER_ERROR)
            .send({ message: SERVER_ERROR });
        });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === 11000) {
        // Handle duplicate email error
        return res
          .status(DUPLICATE_ERROR)
          .send({ message: DUPLICATE_EMAIL_MESSAGE });
      }

      if (err.name === "ValidationError") {
        // Handle validation errors
        return res.status(BAD_REQUEST).send({ message: err.message });
      }

      // Handle other server errors
      return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR });
    });
  return null;
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
      return res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(UNAUTHORIZED).send({ message: AUTHENTICATION_ERROR });
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
    .then((data) => {
      const updatedUser = {
        _id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
      };
      if (!updatedUser) {
        return res.status(NOT_FOUND).send({ message: USER_NOT_FOUND });
      }
      return res.status(200).send(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).send({ message: SERVER_ERROR });
    });
};

// const findUserByCredentials = (email, password) => {
//   console.log(email, password);
//   return User.findOne({ email })
//     .select("+password")
//     .then((user) => {
//       if (!user) {
//         const error = new Error("Invalid username or password.");
//         error.statusCode = 401;
//         throw error;
//       }
//       console.log(user);
//       return bcrypt.compare(password, user.password).then((matched) => {
//         console.log(matched);
//         console.log(password);
//         if (!matched) {
//           const error = new Error("Invalid username or password.");
//           error.statusCode = 401;
//           throw error;
//         }
//         return user;
//       });
//     });
// };

module.exports = {
  getUsers,
  createUser,
  getUser,
  login,
  getCurrentUser,
  updateProfile,
};
