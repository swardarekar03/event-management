import User from "../models/User.js";
import Event from "../models/Event.js";
import Ticket from "../models/Ticket.js";
import Organizer from "../models/Organizer.js";

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

// GET /api/admin/tickets
export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate("userId", "name email")
            .populate("eventId", "title price date venue")
            .sort({ createdAt: -1 });
        res.status(200).json({ tickets });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tickets", error: error.message });
    }
};

// GET /api/admin/organizers
export const getAllOrganizers = async (req, res) => {
    try {
        const organizers = await Organizer.find().sort({ createdAt: -1 });
        res.status(200).json({ organizers });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch organizers", error: error.message });
    }
};

// GET /api/admin/events — all events including pending/rejected
export const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, events });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
};

// DELETE /api/admin/events/:id
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete event", error: error.message });
    }
};

// PATCH /api/admin/events/:id/approve
export const approveEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { status: "approved" },
            { new: true }
        );
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({ message: "Event approved", event });
    } catch (error) {
        res.status(500).json({ message: "Failed to approve event", error: error.message });
    }
};

// PATCH /api/admin/events/:id/reject
export const rejectEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { status: "rejected" },
            { new: true }
        );
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json({ message: "Event rejected", event });
    } catch (error) {
        res.status(500).json({ message: "Failed to reject event", error: error.message });
    }
};

// PATCH /api/admin/users/:id/ban
export const toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.banned = !user.banned;
        await user.save();
        res.status(200).json({
            message: `User ${user.banned ? "banned" : "unbanned"} successfully`,
            banned: user.banned,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user", error: error.message });
    }
};

// PATCH /api/admin/organizers/:id/approve
export const approveOrganizer = async (req, res) => {
    try {
        const organizer = await Organizer.findByIdAndUpdate(
            req.params.id,
            { status: "approved" },
            { new: true }
        );
        if (!organizer) {
            return res.status(404).json({ message: "Organizer not found" });
        }
        res.status(200).json({ message: "Organizer approved", organizer });
    } catch (error) {
        res.status(500).json({ message: "Failed to approve organizer", error: error.message });
    }
};

// PATCH /api/admin/organizers/:id/reject
export const rejectOrganizer = async (req, res) => {
    try {
        const organizer = await Organizer.findByIdAndUpdate(
            req.params.id,
            { status: "rejected" },
            { new: true }
        );
        if (!organizer) {
            return res.status(404).json({ message: "Organizer not found" });
        }
        res.status(200).json({ message: "Organizer rejected", organizer });
    } catch (error) {
        res.status(500).json({ message: "Failed to reject organizer", error: error.message });
    }
};