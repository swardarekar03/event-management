import express from "express";
import jwt from "jsonwebtoken";
import Organizer from "../models/Organizer.js";

const router = express.Router();

// Generate JWT Helper
const generateToken = (organizerId) => {
  return jwt.sign({ id: organizerId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @route   POST /api/organizers/signup
// @desc    Register a new organizer
// @access  Public
router.post("/signup", async (req, res) => {
  const {
    fullName,
    orgName,
    email,
    phone,
    password,
    address,
    city,
    state,
    country,
    pincode,
    idType,
    idNumber,
  } = req.body;

  try {
    // Validation
    if (
      !fullName ||
      !orgName ||
      !email ||
      !phone ||
      !password ||
      !address ||
      !city ||
      !state ||
      !country ||
      !pincode ||
      !idType ||
      !idNumber
    ) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if organizer already exists
    const organizerExists = await Organizer.findOne({ email });
    if (organizerExists) {
      return res.status(400).json({ message: "An organizer with this email already exists" });
    }

    // Create organizer
    const organizer = await Organizer.create({
      fullName,
      orgName,
      email,
      phone,
      password,
      address,
      city,
      state,
      country,
      pincode,
      idType,
      idNumber,
    });

    // Generate JWT
    const token = generateToken(organizer._id);

    res.status(201).json({
      token,
      organizer: {
        id: organizer._id,
        fullName: organizer.fullName,
        orgName: organizer.orgName,
        email: organizer.email,
      },
    });
  } catch (error) {
    console.error("Organizer Signup error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// @route   POST /api/organizers/login
// @desc    Authenticate organizer & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find organizer
    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await organizer.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken(organizer._id);

    res.status(200).json({
      token,
      organizer: {
        id: organizer._id,
        fullName: organizer.fullName,
        orgName: organizer.orgName,
        email: organizer.email,
      },
    });
  } catch (error) {
    console.error("Organizer Login error:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
