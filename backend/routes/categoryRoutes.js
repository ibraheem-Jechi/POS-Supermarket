const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");

// GET all
router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// POST create
router.post("/", async (req, res) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description,
  });
  await category.save();
  res.json(category);
});

// PUT update
router.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, description: req.body.description },
    { new: true }
  );
  res.json(category);
});

// DELETE
router.delete("/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Category deleted" });
});

module.exports = router;
