const path = require("path");
const fs = require("fs");
const Book = require("../models/Book");

const fileUrl = (req, filePath) => {
  if (!filePath) return "";

  return `${req.protocol}://${req.get("host")}/${filePath.replace(
    /\\/g,
    "/"
  )}`;
};

const formatBook = (req, book) => {
  const obj = book.toObject ? book.toObject() : book;

  return {
    ...obj,
    coverImage: fileUrl(req, obj.coverImage),
    bookFile: fileUrl(req, obj.bookFile),
  };
};

// =====================================================
// GET /api/books/home
// Public — Home page data
// =====================================================

exports.getHomeData = async (req, res) => {
  try {
    const featured = await Book.find({ featured: true })
      .populate("category")
      .limit(8);

    const recent = await Book.find()
      .sort({ createdAt: -1 })
      .populate("category")
      .limit(8);

    res.json({
      featured: featured.map((b) => formatBook(req, b)),
      recent: recent.map((b) => formatBook(req, b)),
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to load home data",
      error: err.message,
    });
  }
};

// =====================================================
// GET /api/books/explore
// Public — Explore books
// =====================================================

exports.exploreBooks = async (req, res) => {
  try {
    const {
      category,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    // Category filter
    if (category) {
      const Category = require("../models/Category");

      const cat = await Category.findOne({
        $or: [
          { slug: category },
          {
            _id: /^[0-9a-fA-F]{24}$/.test(category)
              ? category
              : null,
          },
        ],
      });

      if (cat) {
        filter.category = cat._id;
      }
    }

    // Search
    if (search) {
      filter.$text = {
        $search: search,
      };
    }

    const skip =
      (Number(page) - 1) * Number(limit);

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      Book.countDocuments(filter),
    ]);

    res.json({
      books: books.map((b) => formatBook(req, b)),
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to explore books",
      error: err.message,
    });
  }
};

// =====================================================
// GET /api/books/:id
// Public — Book details
//
// IMPORTANT:
// This endpoint DOES NOT increment views.
// Views are handled by:
// POST /api/user-books/history/:bookId
// =====================================================

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(
      req.params.id
    ).populate("category");

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json(formatBook(req, book));
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch book",
      error: err.message,
    });
  }
};

// =====================================================
// GET /api/books/:id/read
// Public / Protected depending on your route
// Returns the actual book file
// =====================================================

exports.readBook = async (req, res) => {
  try {
    const book = await Book.findById(
      req.params.id
    );

    if (!book || !book.bookFile) {
      return res.status(404).json({
        message: "Book file not found",
      });
    }

    const filePath = path.join(
      __dirname,
      "..",
      book.bookFile
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: "File missing on server",
      });
    }

    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load book file",
      error: err.message,
    });
  }
};

// =====================================================
// ADMIN ONLY
// POST /api/books
// =====================================================

exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      category,
      featured,
    } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({
        message:
          "Title, author, and category are required",
      });
    }

    const coverImage =
      req.files?.coverImage?.[0]
        ? `uploads/covers/${req.files.coverImage[0].filename}`
        : "";

    const bookFile =
      req.files?.bookFile?.[0]
        ? `uploads/books/${req.files.bookFile[0].filename}`
        : "";

    const book = await Book.create({
      title,
      author,
      description,
      category,
      featured:
        featured === "true" ||
        featured === true,
      coverImage,
      bookFile,
    });

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create book",
      error: err.message,
    });
  }
};

// =====================================================
// ADMIN ONLY
// PUT /api/books/:id
// =====================================================

exports.updateBook = async (req, res) => {
  try {
    const update = {
      ...req.body,
    };

    if (update.featured !== undefined) {
      update.featured =
        update.featured === "true" ||
        update.featured === true;
    }

    if (req.files?.coverImage?.[0]) {
      update.coverImage =
        `uploads/covers/${req.files.coverImage[0].filename}`;
    }

    if (req.files?.bookFile?.[0]) {
      update.bookFile =
        `uploads/books/${req.files.bookFile[0].filename}`;
    }

    const book =
      await Book.findByIdAndUpdate(
        req.params.id,
        update,
        { new: true }
      );

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update book",
      error: err.message,
    });
  }
};

// =====================================================
// ADMIN ONLY
// DELETE /api/books/:id
// =====================================================

exports.deleteBook = async (req, res) => {
  try {
    const book =
      await Book.findByIdAndDelete(
        req.params.id
      );

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    // Clean up uploaded files
    [
      book.coverImage,
      book.bookFile,
    ].forEach((p) => {
      if (p) {
        const full = path.join(
          __dirname,
          "..",
          p
        );

        if (fs.existsSync(full)) {
          fs.unlinkSync(full);
        }
      }
    });

    res.json({
      message: "Book deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete book",
      error: err.message,
    });
  }
};

// =====================================================
// ADMIN ONLY
// GET /api/books/admin/all
// =====================================================

exports.getAllBooksAdmin = async (req, res) => {
  try {
    const books = await Book.find()
      .populate("category")
      .sort({ createdAt: -1 });

    res.json(
      books.map((b) =>
        formatBook(req, b)
      )
    );
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch books",
      error: err.message,
    });
  }
};