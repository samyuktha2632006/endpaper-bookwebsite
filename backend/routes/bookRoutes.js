const express = require("express");
const router = express.Router();
const {
  getHomeData,
  exploreBooks,
  getBookById,
  readBook,
  createBook,
  updateBook,
  deleteBook,
  getAllBooksAdmin,
} = require("../controllers/bookController");
const { protect, adminOnly } = require("../middleware/auth");
const upload = require("../middleware/upload");

const bookUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "bookFile", maxCount: 1 },
]);

// Public
router.get("/home", getHomeData);
router.get("/explore", exploreBooks);

// Admin
router.get("/admin/all", protect, adminOnly, getAllBooksAdmin);
router.post("/", protect, adminOnly, bookUpload, createBook);
router.put("/:id", protect, adminOnly, bookUpload, updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);

// Logged-in users only — book cover/detail and the actual reading content
// require an account. Keep these after /home, /explore, /admin/all so
// they don't shadow those routes.
router.get("/:id", protect, getBookById);
router.get("/:id/read", protect, readBook);

module.exports = router;
