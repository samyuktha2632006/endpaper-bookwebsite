
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bookRoutes = require("./routes/bookRoutes");
const userBookRoutes = require("./routes/userBookRoutes");

const app = express();

// ---------- CORS CONFIGURATION ----------
const allowedOrigins = [
  "https://samyuktha2632006.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- MIDDLEWARE ----------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- STATIC FILES ----------
// Only book covers are publicly accessible.
app.use(
  "/uploads/covers",
  express.static(path.join(__dirname, "uploads", "covers"))
);

// ---------- API ROUTES ----------
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/user-books", userBookRoutes);

// ---------- HEALTH CHECK ----------
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Book website API is running",
  });
});

// ---------- 404 HANDLER ----------
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// ---------- GLOBAL ERROR HANDLER ----------
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.message === "Not allowed by CORS" ? 403 : 500).json({
    message:
      err.message === "Not allowed by CORS"
        ? "Origin not allowed by CORS"
        : "Internal server error",
  });
});

// ---------- SEED ADMIN ----------
const seedAdmin = async () => {
  const adminExists = await User.findOne({ role: "admin" });

  if (adminExists) {
    console.log("Admin account already exists.");
    return;
  }

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log(
      "Admin not created: ADMIN_NAME, ADMIN_EMAIL, or ADMIN_PASSWORD is missing."
    );
    return;
  }

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  console.log("Admin account created.");
};

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
