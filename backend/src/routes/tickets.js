import express from "express";
import Ticket from "../models/Ticket.js";
import Event from "../models/Event.js";
import Registration from "../models/Registeration.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Ticket routes working" });
});

// Get my tickets
router.get("/my-tickets", protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ attendeeId: req.user.id })
      .populate("event")
      .sort({ createdAt: -1 });

    const tickets = await Ticket.find({
      registration: { $in: registrations.map((r) => r._id) },
    }).populate("registration");

    // Merge event info into each ticket for frontend convenience
    const enriched = tickets.map((ticket) => {
      const reg = registrations.find(
        (r) => r._id.toString() === ticket.registration._id.toString()
      );
      return {
        _id: ticket._id,
        qrCode: ticket.qrCode,
        status: ticket.status,
        createdAt: ticket.createdAt,
        registration: ticket.registration,
        eventId: reg?.event || null,
        quantity: reg?.ticketsBooked || 1,
        ticketId: ticket.qrCode, // keep for any legacy references
      };
    });

    res.json({ success: true, tickets: enriched });
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
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.availableTickets < (quantity || 1)) {
      return res.status(400).json({ message: "Not enough tickets available" });
    }

    if (event.status !== "approved") {
      return res.status(400).json({ message: "Event is not open for booking" });
    }

    // Check if already booked
    const existing = await Registration.findOne({
      event: eventId,
      attendeeEmail: req.user.email,
    });
    if (existing) {
      return res.status(400).json({ message: "You have already booked this event" });
    }

    // 1. Create Registration
    const registration = await Registration.create({
      event: eventId,
      attendeeId: req.user.id,
      attendeeName: req.user.name,
      attendeeEmail: req.user.email,
      ticketsBooked: quantity || 1,
    });

    // 2. Create Ticket — qrCode = registration _id (used for QR scan checkin)
    const ticket = await Ticket.create({
      registration: registration._id,
      qrCode: registration._id.toString(),
      status: "active",
    });

    // 3. Reduce available tickets
    event.availableTickets -= quantity || 1;
    await event.save();

    res.status(201).json({ success: true, ticket, registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Booking failed" });
  }
});

export default router;