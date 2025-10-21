const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");

// --------------------------
// GET all categories
// --------------------------
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: err.message });
  }
});

// --------------------------
// POST create category
// --------------------------
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // Prevent duplicates
    const existing = await Category.findOne({ categoryName: name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      name,              // keep legacy field
      categoryName: name, // used for unique index
      description,
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: err.message });
  }
});

// --------------------------
// PUT update category
// --------------------------
router.put("/:id", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existing = await Category.findOne({
      categoryName: name,
      _id: { $ne: req.params.id }, // ignore current category
    });
    if (existing) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, categoryName: name, description },
      { new: true }
    );

    res.json(category);
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ message: err.message });
  }
});

// --------------------------
// DELETE category
// --------------------------
router.delete("/:id", async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: err.message });
  }
});

// --------------------------
// Admin helper: patch existing categories
// Populate `categoryName` from `name` (run once if you have duplicates/nulls)
// --------------------------
router.post("/patch-name", async (req, res) => {
  try {
    const result = await Category.updateMany(
      { $or: [{ categoryName: { $exists: false } }, { categoryName: null }] },
      [{ $set: { categoryName: "$name" } }]
    );
    res.json({
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error patching categories:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
