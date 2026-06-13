// controllers/eventController.js
import Event from "../models/Event.js";

// @desc    Create a new event
// @route   POST /api/events/create-event
// @access  Private (Organizer only)
export const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizerId: req.user.id,
      organizer: {
        id: req.user.id,
        name: req.user.orgName || req.user.name,
      },
    };
    
    const event = await Event.create(eventData);
    
    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get events for the logged-in organizer
// @route   GET /api/events/getMyEvents
// @access  Private (Organizer only)
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ "organizer.id": req.user.id });
    
    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get my events error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all events (public browse)
// @route   GET /api/events/get-events
// @access  Public
export const getEvents = async (req, res) => {
  try {
    const events = await Event.find({});

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/get-event/:id
// @access  Private
export const singleEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Check if user has access (organizer of the event or admin)
    if (event.organizer.id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    
    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Get single event error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/update-event/:id
// @access  Private (Organizer only)
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Check if the organizer owns this event
    if (event.organizer.id !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only update your own events" });
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Update event error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/delete-event/:id
// @access  Private (Organizer only)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    // Check if the organizer owns this event
    if (event.organizer.id !== req.user.id) {
      return res.status(403).json({ success: false, message: "You can only delete your own events" });
    }
    
    await Event.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};