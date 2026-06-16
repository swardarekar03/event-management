import Notification from "../models/notifications.js";
import Registration from "../models/Registeration.js";
import Event from "../models/Event.js";

// Organizer: Send notification to all registered attendees of an event
export const sendNotificationToEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, message, type } = req.body;
    
    // Debug logging
    console.log("Organizer user from middleware:", req.user);
    
    const organizerId = req.user.id;
    const organizerName = req.user.fullName || req.user.orgName || req.user.name;
    const organizerEmail = req.user.email;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    // Verify event exists and belongs to this organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Debug logging for event ownership
    console.log("Event organizerId:", event.organizerId);
    console.log("Event organizer.id:", event.organizer?.id);
    console.log("Current organizer ID:", organizerId);
    console.log("Type comparison:", typeof event.organizerId, typeof organizerId);

    // Check if organizer owns this event (more flexible matching)
    const isOwner = 
      (event.organizerId && event.organizerId.toString() === organizerId.toString()) ||
      (event.organizer?.id && event.organizer.id.toString() === organizerId.toString()) ||
      (event.createdBy && event.createdBy.toString() === organizerId.toString());

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You can only send notifications for your own events",
      });
    }

    // Get all registered attendees for this event
    const registrations = await Registration.find({ event: eventId });

    if (registrations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No registered attendees for this event",
      });
    }

    // Create notification for each attendee
    const notifications = registrations.map((registration) => ({
      organizerId,
      organizerName,
      organizerEmail,
      eventId,
      eventTitle: event.title,
      audienceId: registration.attendeeId,
      audienceEmail: registration.attendeeEmail,
      audienceName: registration.attendeeName,
      type: type || "announcement",
      title,
      message,
      isBroadcast: true,
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: `Notification sent to ${registrations.length} attendees`,
      count: createdNotifications.length,
      notifications: createdNotifications,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get event notifications for organizer
export const getEventNotificationsForOrganizer = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    console.log("Getting notifications for event:", eventId);
    console.log("Organizer ID:", organizerId);

    // Verify event belongs to organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check ownership (flexible matching)
    const isOwner = 
      (event.organizerId && event.organizerId.toString() === organizerId.toString()) ||
      (event.organizer?.id && event.organizer.id.toString() === organizerId.toString()) ||
      (event.createdBy && event.createdBy.toString() === organizerId.toString());

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized - You don't own this event",
      });
    }

    const notifications = await Notification.find({ eventId })
      .sort({ createdAt: -1 })
      .limit(100);

    // Get unique counts
    const uniqueRecipients = new Set(notifications.map((n) => n.audienceEmail));
    const readCount = notifications.filter((n) => n.isRead).length;

    res.status(200).json({
      success: true,
      notifications,
      stats: {
        totalSent: notifications.length,
        uniqueRecipients: uniqueRecipients.size,
        readCount,
        openRate: notifications.length > 0 ? (readCount / notifications.length) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("Get event notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Audience: Get my notifications
export const getMyNotifications = async (req, res) => {
  try {
    const audienceEmail = req.user.email;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    let query = { audienceEmail };

    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Audience: Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const audienceEmail = req.user.email;

    const notification = await Notification.findOne({
      _id: id,
      audienceEmail,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Audience: Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const audienceEmail = req.user.email;

    const result = await Notification.updateMany(
      { audienceEmail, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Audience: Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const audienceEmail = req.user.email;

    const count = await Notification.countDocuments({
      audienceEmail,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Audience: Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const audienceEmail = req.user.email;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      audienceEmail,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};