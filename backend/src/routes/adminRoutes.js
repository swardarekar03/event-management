import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getAllUsers,
    getAllTickets,
    getAllOrganizers,
    deleteEvent,
    toggleBanUser,
    approveOrganizer,
    rejectOrganizer,
} from "../controllers/adminController.js";

const router = express.Router();

// Middleware to check admin role
const adminOnly = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }
    next();
};

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/tickets", protect, adminOnly, getAllTickets);
router.get("/organizers", protect, adminOnly, getAllOrganizers);
router.delete("/events/:id", protect, adminOnly, deleteEvent);
router.patch("/users/:id/ban", protect, adminOnly, toggleBanUser);
router.patch("/organizers/:id/approve", protect, adminOnly, approveOrganizer);
router.patch("/organizers/:id/reject", protect, adminOnly, rejectOrganizer);

export default router;
