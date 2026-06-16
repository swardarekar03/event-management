import Feedback from "../models/Feedback.js";
import Event from "../models/Event.js";
import Registration from "../models/Registeration.js";

// ==================== AUDIENCE CONTROLLERS ====================

// Create feedback for an event
export const createFeedback = async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;
    const audienceId = req.user.id;
    const audienceName = req.user.name;
    const audienceEmail = req.user.email;

    if (!eventId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Event ID, rating, and comment are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if user has registered for this event
    const registration = await Registration.findOne({
      event: eventId,
      attendeeEmail: audienceEmail,
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: "You can only give feedback for events you have registered for",
      });
    }

    // Check if user already gave feedback for this event
    const existingFeedback = await Feedback.findOne({
      eventId,
      audienceEmail,
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "You have already given feedback for this event",
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      eventId,
      eventTitle: event.title,
      organizerId: event.organizerId || event.organizer?.id,
      organizerName: event.organizer?.name || "Organizer",
      audienceId,
      audienceName,
      audienceEmail,
      rating,
      comment,
      isVerifiedAttendee: true,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my feedbacks (audience)
export const getMyFeedbacks = async (req, res) => {
  try {
    const audienceEmail = req.user.email;

    const feedbacks = await Feedback.find({ audienceEmail })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      feedbacks,
      count: feedbacks.length,
    });
  } catch (error) {
    console.error("Get my feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const audienceEmail = req.user.email;

    const feedback = await Feedback.findOne({ _id: id, audienceEmail });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found or you don't have permission",
      });
    }

    if (rating) feedback.rating = rating;
    if (comment) feedback.comment = comment;

    await feedback.save();

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    console.error("Update feedback error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const audienceEmail = req.user.email;

    const feedback = await Feedback.findOneAndDelete({ _id: id, audienceEmail });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found or you don't have permission",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get feedbacks for an event (audience can see all feedbacks for events they registered)
export const getEventFeedbacks = async (req, res) => {
  try {
    const { eventId } = req.params;
    const audienceEmail = req.user.email;

    // Check if user registered for this event
    const registration = await Registration.findOne({
      event: eventId,
      attendeeEmail: audienceEmail,
    });

    if (!registration) {
      return res.status(403).json({
        success: false,
        message: "You can only view feedbacks for events you registered for",
      });
    }

    const feedbacks = await Feedback.find({ 
      eventId, 
      isPublished: true 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      feedbacks,
      count: feedbacks.length,
    });
  } catch (error) {
    console.error("Get event feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==================== ORGANIZER CONTROLLERS ====================

// Get all feedbacks for organizer's events
export const getOrganizerFeedbacks = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const { eventId, rating, limit = 50 } = req.query;

    let query = { organizerId };

    if (eventId) query.eventId = eventId;
    if (rating) query.rating = parseInt(rating);

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Calculate statistics
    const stats = {
      total: feedbacks.length,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

    let totalRating = 0;
    feedbacks.forEach(f => {
      totalRating += f.rating;
      stats.ratingDistribution[f.rating]++;
      if (f.organizerResponded) {
        stats.responded++;
      } else {
        stats.notResponded++;
      }
    });

    stats.averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      feedbacks,
      stats,
    });
  } catch (error) {
    console.error("Get organizer feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get feedback statistics for a specific event
export const getEventFeedbackStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    // Verify event belongs to organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const isOwner = event.organizerId?.toString() === organizerId ||
                    event.organizer?.id?.toString() === organizerId;

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const feedbacks = await Feedback.find({ eventId });

    const stats = {
      total: feedbacks.length,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentFeedbacks: feedbacks.slice(0, 10),
    };

    let totalRating = 0;
    feedbacks.forEach(f => {
      totalRating += f.rating;
      stats.ratingDistribution[f.rating]++;
    });

    stats.averageRating = feedbacks.length > 0 ? (totalRating / feedbacks.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Get event feedback stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};