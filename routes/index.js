const router = require("express").Router();

const userRouter = require("./users");
const itemRouter = require("./clothingItem");
const likesRouter = require("./likes");
const NotFoundError = require("../Errors/NotFoundError");

const auth = require("../middlewares/auth");

const { NOT_FOUND, ROUTER_NOT_FOUND } = require("../utils/errors");

router.use("/items", itemRouter);

router.use(auth);

router.use("/users", userRouter);
router.use("/items", likesRouter);

router.use((req, res) => {
  next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
