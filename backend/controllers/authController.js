const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// ==============================
// JWT TOKEN
// ==============================
const signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==============================
// SIGNUP
// ==============================
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      authProvider: "local",
      lastLogin: new Date(),
    });

    const token = signToken(user._id);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// LOGIN
// ==============================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // password is select:false, so explicitly select it
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ==============================
// GOOGLE LOGIN
// ==============================
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    // Verify Google credential
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      picture,
      email_verified,
    } = payload;

    if (!email || !email_verified) {
      return res.status(401).json({
        message: "Google account could not be verified",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Existing account
      if (!user.googleId) {
        user.googleId = googleId;
      }

      user.profilePicture =
        picture || user.profilePicture;

      // Update last login time
      user.lastLogin = new Date();

      await user.save();
    } else {
      // Create new Google account
      user = await User.create({
        name: name || "Google User",
        email,
        googleId,
        profilePicture: picture || "",
        authProvider: "google",
        lastLogin: new Date(),
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      message: "Google login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);

    res.status(401).json({
      message: "Google authentication failed",
    });
  }
};

// ==============================
// CURRENT LOGGED-IN USER
// ==============================
const getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);

    res.status(500).json({
      message: "Could not get user",
    });
  }
};

module.exports = {
  signup,
  login,
  googleLogin,
  getMe,
};