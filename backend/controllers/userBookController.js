const UserBook = require("../models/UserBook");
const Book = require("../models/Book");

// ==========================================
// ❤️ LIKE / UNLIKE BOOK
// ==========================================
const toggleLike = async (req, res) => {
  try {
    const { bookId } = req.params;

    let userBook = await UserBook.findOne({
      user: req.user._id,
      book: bookId,
    });

    if (!userBook) {
      userBook = await UserBook.create({
        user: req.user._id,
        book: bookId,
        liked: true,
      });
    } else {
      userBook.liked = !userBook.liked;
      await userBook.save();
    }

    res.json({
      liked: userBook.liked,
    });
  } catch (error) {
    console.error("Toggle like error:", error);

    res.status(500).json({
      message: "Could not update like",
      error: error.message,
    });
  }
};


// ==========================================
// 🔍 GET BOOK STATUS
// ==========================================
const getBookStatus = async (req, res) => {
  try {
    const { bookId } = req.params;

    const userBook = await UserBook.findOne({
      user: req.user._id,
      book: bookId,
    });

    res.json({
      liked: userBook?.liked || false,
      lastReadAt: userBook?.lastReadAt || null,
    });
  } catch (error) {
    console.error("Get book status error:", error);

    res.status(500).json({
      message: "Could not get book status",
      error: error.message,
    });
  }
};


// ==========================================
// 📖 MARK BOOK AS READ
// ==========================================
const markAsRead = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Find this user's record for this book
    let userBook = await UserBook.findOne({
      user: req.user._id,
      book: bookId,
    });

    // ==========================================
    // FIRST TIME THIS USER READS THE BOOK
    // ==========================================
    if (!userBook) {
      userBook = await UserBook.create({
        user: req.user._id,
        book: bookId,
        liked: false,
        lastReadAt: new Date(),
      });

      // Increase views ONLY ONCE
      await Book.findByIdAndUpdate(
        bookId,
        {
          $inc: {
            views: 1,
          },
        }
      );
    }

    // ==========================================
    // USER HAS ALREADY READ THIS BOOK
    // ==========================================
    else {
      // Don't increase views again.
      // Only update reading history.
      userBook.lastReadAt = new Date();

      await userBook.save();
    }

    // Get updated book
    const updatedBook = await Book.findById(bookId);

    res.json({
      message: "Reading history updated",
      lastReadAt: userBook.lastReadAt,
      views: updatedBook?.views || 0,
    });

  } catch (error) {
    console.error("Mark as read error:", error);

    res.status(500).json({
      message: "Could not update reading history",
      error: error.message,
    });
  }
};


// ==========================================
// 📚 GET MY LIBRARY
// ==========================================
const getMyLibrary = async (req, res) => {
  try {
    const fileUrl = (filePath) => {
      if (!filePath) {
        return "";
      }

      if (
        filePath.startsWith("http://") ||
        filePath.startsWith("https://")
      ) {
        return filePath;
      }

      return `${req.protocol}://${req.get("host")}/${filePath
        .replace(/\\/g, "/")
        .replace(/^\/+/, "")}`;
    };

    const userBooks = await UserBook.find({
      user: req.user._id,

      $or: [
        {
          liked: true,
        },
        {
          lastReadAt: {
            $ne: null,
          },
        },
      ],
    })
      .populate({
        path: "book",
        populate: {
          path: "category",
        },
      })
      .sort({
        lastReadAt: -1,
        updatedAt: -1,
      });

    // ==========================================
    // FORMAT BOOK
    // ==========================================
    const formatBook = (book) => {
      if (!book) {
        return null;
      }

      const obj = book.toObject();

      return {
        ...obj,

        coverImage: fileUrl(
          obj.coverImage
        ),

        bookFile: fileUrl(
          obj.bookFile
        ),
      };
    };

    // ==========================================
    // ❤️ LIKED BOOKS
    // ==========================================
    const likedBooks = userBooks
      .filter(
        (item) =>
          item.liked === true &&
          item.book
      )
      .map(
        (item) =>
          formatBook(item.book)
      );

    // ==========================================
    // 📖 READING HISTORY
    // ==========================================
    const history = userBooks
      .filter(
        (item) =>
          item.lastReadAt &&
          item.book
      )
      .map(
        (item) => ({
          book: formatBook(item.book),
          lastReadAt: item.lastReadAt,
        })
      );

    res.json({
      likedBooks,
      history,
    });

  } catch (error) {
    console.error(
      "Get library error:",
      error
    );

    res.status(500).json({
      message: "Could not load library",
      error: error.message,
    });
  }
};


// ==========================================
// 🗑️ CLEAR ALL HISTORY
// ==========================================
const clearHistory = async (req, res) => {
  try {
    // Remove reading dates
    await UserBook.updateMany(
      {
        user: req.user._id,

        lastReadAt: {
          $ne: null,
        },
      },
      {
        $set: {
          lastReadAt: null,
        },
      }
    );

    // Delete records that are not liked
    await UserBook.deleteMany({
      user: req.user._id,

      liked: false,

      lastReadAt: null,
    });

    res.json({
      message: "Reading history cleared",
    });

  } catch (error) {
    console.error(
      "Clear history error:",
      error
    );

    res.status(500).json({
      message:
        "Could not clear history",
      error: error.message,
    });
  }
};


// ==========================================
// 🗑️ DELETE ONE HISTORY BOOK
// ==========================================
const deleteHistoryItem = async (
  req,
  res
) => {
  try {
    const { bookId } = req.params;

    const userBook = await UserBook.findOne({
      user: req.user._id,
      book: bookId,
    });

    if (!userBook) {
      return res.status(404).json({
        message:
          "Book not found in reading history",
      });
    }

    // ==========================================
    // BOOK IS ALSO LIKED
    // Keep the record, remove only history
    // ==========================================
    if (userBook.liked === true) {
      userBook.lastReadAt = null;

      await userBook.save();
    }

    // ==========================================
    // BOOK IS NOT LIKED
    // Delete the record
    // ==========================================
    else {
      await UserBook.deleteOne({
        _id: userBook._id,
      });
    }

    res.json({
      message:
        "Book removed from reading history",
    });

  } catch (error) {
    console.error(
      "Delete history error:",
      error
    );

    res.status(500).json({
      message:
        "Could not remove book from history",
      error: error.message,
    });
  }
};


// ==========================================
// EXPORT
// ==========================================
module.exports = {
  toggleLike,
  getBookStatus,
  markAsRead,
  getMyLibrary,
  clearHistory,
  deleteHistoryItem,
};