const ClothingItem = require("../models/clothingItem");

const createItem = (req, res) => {
  console.log(req.user._id);

  const owner = req.user._id;

  const { name, weather, imageUrl } = req.body;

  if (!name || !weather || !imageUrl) {
    return res
      .status(400)
      .json({ message: "Missing required fields: name, weather, or imageUrl" });
  }

  if (!owner) {
    return res.status(400).json({ message: "Owner is required" });
  }
  if (!req.user || !req.user._id) {
    return res
      .status(400)
      .json({ message: "User not authenticated or missing user ID" });
  }

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).json({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      }
      res.status(500).json({ message: "Error from createItem", err });
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      } else {
        return res.status(500).json({ message: err.message });
      }
    });
};

const updateItem = (req, res) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res
      .status(400)
      .json({ message: "Missing required field: imageUrl" });
  }

  ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
    .orFail()
    .then((item) => res.status(200).json({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      } else {
        return res.status(500).json({ message: err.message });
      }
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  // **[Change 1]** Validate the itemId (to ensure it's a valid ObjectId)
  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return res.status(400).json({ message: "Invalid item ID format" });
  }

  ClothingItem.findByIdAndDelete(itemId)
    .then((item) => {
      if (!item) {
        console.error("Item not found");
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json({ message: "Item deleted successfully" });
    })
    .catch((err) => {
      console.error("Error deleting item:", err);

      // **[Change 2]** Handle Mongoose CastError for invalid ObjectId
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid item ID format" });
      }

      return res
        .status(500)
        .json({ message: "Error deleting item", error: err.message });
    });
};

const likeItem = (req, res) => {
  const { itemId } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return res.status(400).json({ message: "Invalid item ID format" });
  }

  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json({ data: item });
    })
    .catch((err) =>
      res.status(500).json({ message: "Error liking item", error: err })
    );
};

const dislikeItem = (req, res) => {
  const { itemId } = req.params;

  // Validate the itemId (to ensure it's a valid ObjectId)
  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return res.status(400).json({ message: "Invalid item ID format" });
  }

  ClothingItem.findByIdAndUpdate(
    itemId, // Using itemId directly
    { $pull: { likes: req.user._id } }, // Remove the user ID from the likes array
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(200).json({ data: item });
    })
    .catch((err) => {
      console.error("Error unliking item:", err);

      // Handle specific Mongoose CastError for invalid ObjectId
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid item ID format" });
      }

      return res
        .status(500)
        .json({ message: "Error unliking item", error: err.message });
    });
};

module.exports = {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
