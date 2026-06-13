import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
    getAllUsers,
    getAllTickets,
    getAllOrganizers,
    getAllEvents,
    deleteEvent,
    toggleBanUser,
    approveOrganizer,
    rejectOrganizer,
    approveEvent,
    rejectEvent,
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
router.get("/events", protect, adminOnly, getAllEvents);                      // ← new
router.delete("/events/:id", protect, adminOnly, deleteEvent);
router.patch("/events/:id/approve", protect, adminOnly, approveEvent);       // ← new
router.patch("/events/:id/reject", protect, adminOnly, rejectEvent);         // ← new
router.patch("/users/:id/ban", protect, adminOnly, toggleBanUser);
router.patch("/organizers/:id/approve", protect, adminOnly, approveOrganizer);
router.patch("/organizers/:id/reject", protect, adminOnly, rejectOrganizer);

export default router;