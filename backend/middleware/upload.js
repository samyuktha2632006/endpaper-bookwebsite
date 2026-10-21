const multer = require("multer");
const path = require("path");
const fs = require("fs");

const coverDir = path.join(__dirname, "..", "uploads", "covers");
const bookDir = path.join(__dirname, "..", "uploads", "books");
[coverDir, bookDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "coverImage") return cb(null, coverDir);
    if (file.fieldname === "bookFile") return cb(null, bookDir);
    cb(new Error("Unexpected field"), null);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "coverImage") {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Cover image must be an image file"));
    }
  }
  if (file.fieldname === "bookFile") {
    const allowed = [".pdf", ".epub", ".txt"];
    if (!allowed.includes(path.extname(file.originalname).toLowerCase())) {
      return cb(new Error("Book file must be .pdf, .epub, or .txt"));
    }
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = upload;
