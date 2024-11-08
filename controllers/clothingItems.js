const ClothingItem = require("../models/clothingItem");

const createItem = (req, res) => {
  console.log(req.user._id);

  const owner = req.user._id;

  const { name, weather, imageUrl } = req.body;

  if (!owner) {
    return res.status(400).json({ message: "Owner is required" });
  }

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).json({ data: item }))
    .catch((e) =>
      res.status(500).json({ message: "Error from createItem", e })
    );
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

  // console.log(itemId);
  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then(() => res.status(204).json({}))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(400).json({ message: err.message });
      } else {
        return res.status(400).json({ message: err.message });
      }
    });
};

module.exports = { createItem, getItems, updateItem, deleteItem };
