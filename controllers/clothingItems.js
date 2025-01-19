const ClothingItem = require("../models/clothingItem");
const BadRequestError = require("../Errors/BadRequestError");
const NotFoundError = require("../Errors/NotFoundError");
const ForbiddenError = require("../Errors/ForbiddenError");

const createItem = (req, res, next) => {
  const owner = req.user._id;
  const { name, weather, imageUrl } = req.body;

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).json({ data: item }))
    .catch((err) => {
      console.error("Error during item creation:", err);
      if (err.name === "ValidationError") {
        next(new BadRequestError(err.message));
      } else {
        next(err);
      }
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).json(items))
    .catch((err) => {
      console.error("Error during fetching items:", err);
      next(err); // Pass to the centralized handler
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  // Validate that the itemId is a valid ObjectId
  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return next(new BadRequestError("Invalid item ID format"));
  }

  // Find the item by ID first, then check if the owner matches the authenticated user
  return ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");
      }

      if (item.owner.toString() !== req.user._id.toString()) {
        throw new ForbiddenError(
          "You do not have permission to delete this item."
        );
      }

      return item
        .remove()
        .then(() =>
          res.status(200).json({ message: "Item deleted successfully" })
        );
    })
    .catch(next);
};

const likeItem = (req, res, next) => {
  const { itemId } = req.params;

  // Validate the itemId (to ensure it's a valid ObjectId)
  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return next(new BadRequestError("Invalid item ID format"));
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");
      }
      res.status(200).json({ data: item });
    })
    .catch(next); // Pass all errors to the centralized handler
};

const dislikeItem = (req, res, next) => {
  const { itemId } = req.params;

  // Validate the itemId (to ensure it's a valid ObjectId)
  if (!/^[0-9a-fA-F]{24}$/.test(itemId)) {
    return next(new BadRequestError("Invalid item ID format"));
  }

  return ClothingItem.findByIdAndUpdate(
    itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then((item) => {
      if (!item) {
        throw new NotFoundError("Item not found");
      }
      res.status(200).json({ data: item });
    })
    .catch((err) => {
      console.error("Error during dislike operation:", err);
      next(err); // Pass all errors to the centralized handler
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
