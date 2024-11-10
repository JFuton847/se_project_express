const router = require("express").Router();

const userRouter = require("./users");
const itemRouter = require("./clothingItem");
const likesRouter = require("./likes");

const { NOT_FOUND, ROUTER_NOT_FOUND } = require("../utils/errors");

router.use("/users", userRouter);
router.use("/items", itemRouter);
router.use("/items", likesRouter);

router.use((req, res) => {
  res.status(NOT_FOUND).send({ message: ROUTER_NOT_FOUND });
});

module.exports = router;
