import express from "express";
import jwt from "jsonwebtoken";
import Organizer from "../models/Organizer.js";
import protectOrganizer from "../middleware/organizerAuthMiddleware.js";

const router = express.Router();

// Generate JWT Helper
const generateToken = (organizerId) => {
  return jwt.sign({ id: organizerId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @route   POST /api/organizer/signup
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
      return res.status(400).json({ success: false, message: "Please fill in all fields" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Check if organizer already exists
    const organizerExists = await Organizer.findOne({ email });
    if (organizerExists) {
      return res.status(400).json({ success: false, message: "An organizer with this email already exists" });
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
      status: "pending", // Default status is pending
    });

    // Generate JWT (but they can't login until approved)
    const token = generateToken(organizer._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: organizer._id,
        fullName: organizer.fullName,
        orgName: organizer.orgName,
        email: organizer.email,
        phone: organizer.phone,
        address: organizer.address,
        city: organizer.city,
        state: organizer.state,
        country: organizer.country,
        pincode: organizer.pincode,
        status: organizer.status,
      },
    });
  } catch (error) {
    console.error("Organizer Signup error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// @route   POST /api/organizer/login
// @desc    Authenticate organizer & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // Find organizer
    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await organizer.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check if organizer is approved
    if (organizer.status !== "approved") {
      return res.status(403).json({ 
        success: false, 
        message: `Your account is ${organizer.status}. Please wait for admin approval.` 
      });
    }

    // Generate JWT
    const token = generateToken(organizer._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: organizer._id,
        fullName: organizer.fullName,
        orgName: organizer.orgName,
        email: organizer.email,
        phone: organizer.phone,
        address: organizer.address,
        city: organizer.city,
        state: organizer.state,
        country: organizer.country,
        pincode: organizer.pincode,
        status: organizer.status,
      },
    });
  } catch (error) {
    console.error("Organizer Login error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
});

// @route   PUT /api/organizer/update-profile
// @desc    Update organizer profile
// @access  Private (Organizer only)
router.put("/update-profile", protectOrganizer, async (req, res) => {
  try {
    const organizerId = req.user.id;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates._id;
    delete updates.status;
    delete updates.createdAt;
    
    const updatedOrganizer = await Organizer.findByIdAndUpdate(
      organizerId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!updatedOrganizer) {
      return res.status(404).json({ success: false, message: "Organizer not found" });
    }
    
    res.json({
      success: true,
      user: updatedOrganizer,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

// @route   GET /api/organizer/my-profile
// @desc    Get organizer profile
// @access  Private (Organizer only)
router.get("/my-profile", protectOrganizer, async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.user.id).select("-password");
    if (!organizer) {
      return res.status(404).json({ success: false, message: "Organizer not found" });
    }
    
    res.json({
      success: true,
      user: organizer,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Failed to get profile" });
  }
});

export default router;