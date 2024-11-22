const ClothingItem = require("../models/clothingItem");

const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  SERVER_ERROR,
  ITEM_NOT_FOUND,
  INVALID_ITEM_ID,
} = require("../utils/errors");

const createItem = (req, res) => {
  const owner = req.user._id;
  const { name, weather, imageUrl } = req.body;

  // if (!name || !weather || !imageUrl) {
  //   return res
  //     .status(400)
  //     .json({ message: "Missing required fields: name, weather, or imageUrl" });
  // }

  // if (!owner) {
  //   return res.status(400).json({ message: "Owner is required" });
  // }
  // if (!req.user || !req.user._id) {
  //   return res
  //     .status(400)
  //     .json({ message: "User not authenticated or missing user ID" });
  // }

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).json({ data: item }))
    .catch((err) => {
      console.error("Error during item creation:", err);
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR });
    });
};

const getItems = (req, res) =>
  ClothingItem.find({})
    .then((items) => res.status(200).json(items))
    .catch(() => {
      res.status(INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR });
    });

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  // Validate that the itemId is a valid ObjectId
  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return res.status(BAD_REQUEST).json({ message: INVALID_ITEM_ID });
  }

  // Find the item by ID first, then check if the owner matches the authenticated user
  return ClothingItem.findById(itemId)
    .then((item) => {
      // If the item doesn't exist, return 404
      if (!item) {
        return res.status(NOT_FOUND).json({ message: ITEM_NOT_FOUND });
      }

      // Check if the authenticated user is the owner of the item
      if (item.owner.toString() !== req.user._id.toString()) {
        // If the user is not the owner, return a 403 Forbidden error
        return res
          .status(403)
          .json({ message: "You do not have permission to delete this item." });
      }

      // If the user is the owner, proceed with the deletion
      return item
        .remove()
        .then(() =>
          res.status(200).json({ message: "Item deleted successfully" })
        )
        .catch((err) => {
          console.error("Error during item deletion:", err);
          return res
            .status(INTERNAL_SERVER_ERROR)
            .json({ message: SERVER_ERROR });
        });
    })
    .catch((err) => {
      // Handle any other errors like invalid ObjectId
      console.error("Error during item lookup:", err);
      return res.status(INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR });
    });
};

const likeItem = (req, res) => {
  const { itemId } = req.params;

  // Validate the itemId (to ensure it's a valid ObjectId)
  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return res.status(BAD_REQUEST).json({ message: INVALID_ITEM_ID });
  }

  return ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).json({ message: ITEM_NOT_FOUND });
      }
      return res.status(200).json({ data: item });
    })
    .catch(() =>
      res.status(INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR })
    );
};

const dislikeItem = (req, res) => {
  const { itemId } = req.params;

  // Validate the itemId (to ensure it's a valid ObjectId)
  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return res.status(BAD_REQUEST).json({ message: INVALID_ITEM_ID });
  }

  return ClothingItem.findByIdAndUpdate(
    itemId, // Using itemId directly
    { $pull: { likes: req.user._id } }, // Remove the user ID from the likes array
    { new: true }
  )
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).json({ message: ITEM_NOT_FOUND });
      }
      return res.status(200).json({ data: item });
    })
    .catch((err) => {
      // Handle specific Mongoose CastError for invalid ObjectId
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: INVALID_ITEM_ID });
      }

      return res.status(INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR });
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
