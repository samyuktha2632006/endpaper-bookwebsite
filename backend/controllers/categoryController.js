const Category = require("../models/Category");
const Book = require("../models/Book");

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// GET /api/categories  (public) — includes each category's book count
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const counts = await Book.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

    const withCounts = categories.map((c) => ({
      ...c,
      bookCount: countMap[String(c._id)] || 0,
    }));

    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories", error: err.message });
  }
};

// POST /api/categories  (admin only)
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const slug = slugify(name);
    const exists = await Category.findOne({ slug });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to create category", error: err.message });
  }
};

// PUT /api/categories/:id  (admin only)
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const update = {};
    if (name) {
      update.name = name;
      update.slug = slugify(name);
    }
    const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to update category", error: err.message });
  }
};

// DELETE /api/categories/:id  (admin only)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category", error: err.message });
  }
};
