const ClothingItem = require("../models/clothingItem");

const createItem = (req, res) => {
  console.log(req.user._id);

  const { name, weather, imageUrl, owner } = req.body;

  if (!owner) {
    return res.status(400).send({ message: "Owner is required" });
  }

  return ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.send({ data: item }))
    .catch((e) =>
      res.status(500).json({ message: "Error from createItem", e })
    );
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((e) => {
      res.status(500).json({ message: "Error from getItems", e });
    });
};

const updateItem = (req, res) => {
  const { itemId } = req.params;
  const { imageUrl } = req.body;

  ClothingItem.findByIdAndUpdate(itemId, { $set: { imageUrl } })
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((e) =>
      res.status(500).json({ message: "Error from updateItem", e })
    );
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;

  // console.log(itemId);
  ClothingItem.findByIdAndDelete(itemId)
    .orFail()
    .then(() => res.status(204).send({}))
    .catch((e) => {
      res.status(400).json({ message: "Error from deleteItem", e });
    });
};

module.exports = { createItem, getItems, updateItem, deleteItem };
