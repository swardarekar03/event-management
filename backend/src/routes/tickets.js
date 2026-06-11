import express from "express";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Ticket routes working" });
});

// Get my tickets
router.get("/my-tickets", protect, async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.user.id })
      .populate("eventId")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

// Booking route
router.post("/book", protect, async (req, res) => {
  try {
    const { eventId, quantity } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    const ticket = await Ticket.create({
      ticketId: "TKT-" + Date.now(),
      userId: req.user.id,
      eventId,
      quantity: quantity || 1,
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Booking failed",
    });
  }
});

export default router;