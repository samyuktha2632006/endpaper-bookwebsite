const mongoose = require("mongoose");

const userBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    liked: {
      type: Boolean,
      default: false,
    },

    lastReadAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One record per user + book
userBookSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model("UserBook", userBookSchema);