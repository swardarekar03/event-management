import Event from "../models/Event.js";

export const createEvent = async (req, res) => {
    try {
        const event = await Event.create(req.body);

        res.status(201).json({
            success: true,
            event
        });
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const getEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            events
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "failed to fetch events",
            error: error.message
        });
    }
};

export const singleEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(401).json({
                message: "No Such Event",
            });
        }

        res.status(200).json({
            success: true,
            event
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(401).json({
                success: false,
                message: "No Such Event",
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,

            {
                new: true,
                runValidators: true,
            }
        );

        res, status(200).json({
            success: true,
            event: updatedEvent,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(401).json({
                success: false,
                message: "No such Event"
            });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};