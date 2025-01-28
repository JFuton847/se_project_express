const express = require("express");
const { likeItem, dislikeItem } = require("../controllers/clothingItems");
const { validateId } = require("../middlewares/validation");

// const auth = require("../middleware/auth");
const router = express.Router();

router.put("/:itemId/likes", validateId, likeItem);

router.delete("/:itemId/likes", dislikeItem);

module.exports = router;
