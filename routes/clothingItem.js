const router = require("express").Router();
const auth = require("../middlewares/auth");
const { validateId } = require("../middlewares/validation");

const {
  createItem,
  getItems,
  deleteItem,
} = require("../controllers/clothingItems");
const { validateClothingItemBody } = require("../middlewares/validation");
// CRUD

// Create
router.post("/", auth, validateClothingItemBody, createItem);

// Read

router.get("/", getItems);

// Update

// router.put("/:itemId", updateItem);

// Delete

router.delete("/:itemId", auth, validateId, deleteItem);
// router.delete("/:itemId/likes", dislikeItem);

module.exports = router;
