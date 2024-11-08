const express = require("express");
const { likeItem, dislikeItem } = require("../controllers/clothingItems");

// const auth = require("../middleware/auth");
const router = express.Router();

router.put("/:itemId/likes", likeItem);

router.delete("/:itemId/likes", dislikeItem);

module.exports = router;
