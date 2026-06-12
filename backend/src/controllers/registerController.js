import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

export const registerForEvent = async (req, res) => {
  try {
    const {
      eventId,
      attendeeName,
      attendeeEmail,
      ticketsBooked,
    } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (event.availableTickets < ticketsBooked) {
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available",
      });
    }

    const registration = await Registration.create({
      event: eventId,
      attendeeName,
      attendeeEmail,
      ticketsBooked,
    });

    event.availableTickets -= ticketsBooked;

    await event.save();

    res.status(201).json({
      success: true,
      registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("event");

    res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
    }).populate("event");

    res.status(200).json({
      success: true,
      registrations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const checkInAttendee = async (req, res) => {
  try {
    const registration = await Registration.findById(
      req.params.id
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }

    registration.checkInStatus = true;

    await registration.save();

    res.status(200).json({
      success: true,
      registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};