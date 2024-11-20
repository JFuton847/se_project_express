const router = require("express").Router();
const {
  getUsers,
  createUser,
  getUser,
  getCurrentUser,
  updateProfile,
} = require("../controllers/users");

router.get("/me", getCurrentUser);

router.patch("/me", updateProfile);

// router.get("/", getUsers);
// router.get("/:userId", getUser);
// router.post("/", createUser);

module.exports = router;
