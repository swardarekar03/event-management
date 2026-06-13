import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Organizer from "../models/Organizer.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try User model first
    let account = await User.findById(decoded.id).select("-password");
    let role = account?.role || "user";

    // If not found in User, try Organizer model
    if (!account) {
      account = await Organizer.findById(decoded.id).select("-password");
      if (!account) {
        return res.status(401).json({ message: "User not found" });
      }
      role = "organizer";
    }

    if (account.banned) {
      return res.status(403).json({ message: "Your account has been banned." });
    }

    req.user = {
      id: account._id,
      role,
      name: account.name || account.fullName,
      orgName: account.orgName || null,  // ← added for organizer event creation
      email: account.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default protect;