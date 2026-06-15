import Registration from "../models/Registeration.js";
import Event from "../models/Event.js";

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const ticketsBooked = Number(req.body.ticketsBooked || req.body.quantity || 1);
    const attendeeEmail = req.user.email;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    if (event.availableTickets < ticketsBooked) return res.status(400).json({ success: false, message: "Not enough tickets available" });
    if (!ticketsBooked || ticketsBooked < 1) return res.status(400).json({ success: false, message: "Tickets booked must be at least 1" });
    if (event.status !== "approved") return res.status(400).json({ success: false, message: "Event is not open for registration" });

    const existingRegistration = await Registration.findOne({ event: eventId, attendeeEmail });
    if (existingRegistration) return res.status(400).json({ success: false, message: "You have already registered for this event" });

    const registration = await Registration.create({
      event: eventId,
      attendeeId: req.user.id,
      attendeeName: req.user.name,
      attendeeEmail: req.user.email,
      ticketsBooked,
    });

    event.availableTickets -= ticketsBooked;
    await event.save();

    res.status(201).json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ attendeeEmail: req.user.email }).populate("event");
    res.status(200).json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      organizerId: req.user.id,
    });
    if (!event) return res.status(403).json({ success: false, message: "Unauthorized" });

    const registrations = await Registration.find({ event: req.params.eventId }).populate("event");
    res.status(200).json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const checkInAttendee = async (req, res) => {
  try {
    let id = req.params.id;

    try {
      const parsed = JSON.parse(decodeURIComponent(id));
      if (parsed.registrationId) id = parsed.registrationId;
    } catch {}

    const registration = await Registration.findById(id).populate("event");
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });

    const organizerId = registration.event?.organizerId;

    // ✅ req.user.id not req.user._id — middleware sets .id
    if (!organizerId || organizerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (registration.checkInStatus) {
      return res.status(400).json({ success: false, message: "Attendee already checked in" });
    }

    registration.checkInStatus = true;
    await registration.save();

    res.status(200).json({ success: true, registration });
  } catch (error) {
    console.error("checkInAttendee ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRegistrationById = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate({
      path: "event",
      select: "title date venue organizerId",
    });
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });

    const isAttendee = registration.attendeeEmail === req.user.email;
    const isOrganizer = registration.event?.organizerId?.toString() === req.user.id.toString();

    if (!isAttendee && !isOrganizer) return res.status(403).json({ success: false, message: "Unauthorized" });

    res.status(200).json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrganizerRegistrations = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user.id });
    const eventIds = events.map(e => e._id);
    const registrations = await Registration.find({ event: { $in: eventIds } }).populate("event");
    res.status(200).json({ success: true, registrations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { ticketsBooked } = req.body;

    const registration = await Registration.findById(id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    registration.ticketsBooked = ticketsBooked;

    await registration.save();

    res.status(200).json({
      success: true,
      registration,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    const event = await Event.findById(registration.event);

    if (event) {
      event.availableTickets += registration.ticketsBooked;
      await event.save();
    }

    await Registration.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};