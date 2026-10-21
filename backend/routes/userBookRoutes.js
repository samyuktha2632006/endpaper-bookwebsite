const express = require("express");

const router = express.Router();

const {
  toggleLike,
  getBookStatus,
  markAsRead,
  getMyLibrary,
  clearHistory,
  deleteHistoryItem,
} = require("../controllers/userBookController");

const { protect } = require("../middleware/auth");


// ==========================================
// ❤️ LIKE / UNLIKE
// ==========================================
router.post(
  "/like/:bookId",
  protect,
  toggleLike
);


// ==========================================
// 🔍 BOOK STATUS
// ==========================================
router.get(
  "/status/:bookId",
  protect,
  getBookStatus
);


// ==========================================
// 📖 READING HISTORY
// ==========================================
router.post(
  "/history/:bookId",
  protect,
  markAsRead
);


// ==========================================
// 📚 MY LIBRARY
// ==========================================
router.get(
  "/library",
  protect,
  getMyLibrary
);


// ==========================================
// 🗑️ CLEAR ALL HISTORY
// ==========================================
router.delete(
  "/history",
  protect,
  clearHistory
);


// ==========================================
// 🗑️ DELETE ONE HISTORY ITEM
// ==========================================
router.delete(
  "/history/:bookId",
  protect,
  deleteHistoryItem
);


module.exports = router;