const ClothingItem = require("../models/clothingItem");

const {
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  MISSING_FIELDS,
  OWNER_REQUIRED,
  AUTHENTICATION_ERROR,
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
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR });
    });
};

const getItems = (req, res) =>
  ClothingItem.find({})
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR });
    });

const updateItem = (req, res) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(BAD_REQUEST).json({ message: MISSING_FIELDS });
  }

  return ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
    .orFail()
    .then((item) => res.status(200).json({ data: item }))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).json({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({ message: SERVER_ERROR });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return res.status(BAD_REQUEST).json({ message: INVALID_ITEM_ID });
  }

  return ClothingItem.findByIdAndDelete(itemId)
    .then((item) => {
      if (!item) {
        return res.status(NOT_FOUND).json({ message: ITEM_NOT_FOUND });
      }
      return res.status(200).json({ message: "Item deleted successfully" });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).json({ message: INVALID_ITEM_ID });
      }

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
    .catch((err) =>
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
  updateItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
