// middleware/organizerAuthMiddleware.js
import jwt from "jsonwebtoken";
import Organizer from "../models/Organizer.js";

const protectOrganizer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch organizer
    const organizer = await Organizer.findById(decoded.id).select("-password");
    if (!organizer) {
      return res.status(401).json({ success: false, message: "Organizer not found" });
    }

    // Check if organizer is approved
    if (organizer.status !== "approved") {
      return res.status(403).json({ 
        success: false, 
        message: `Your account is ${organizer.status}. Please wait for admin approval.` 
      });
    }

    req.user = {
      id: organizer._id,
      role: "organizer",
      name: organizer.fullName,
      email: organizer.email,
      orgName: organizer.orgName,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default protectOrganizer;