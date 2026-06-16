import express from "express";
import protect from "../middleware/authMiddleware.js";
import protectOrganizer from "../middleware/organizerAuthMiddleware.js";
import {
  // Audience endpoints
  createFeedback,
  getMyFeedbacks,
  updateFeedback,
  deleteFeedback,
  getEventFeedbacks,
  
  // Organizer endpoints
  getOrganizerFeedbacks,
  getEventFeedbackStats,

} from "../controllers/feedbackController.js";

const router = express.Router();

// Audience routes (protected by user auth)
router.post("/create", protect, createFeedback);
router.get("/my-feedbacks", protect, getMyFeedbacks);
router.put("/:id", protect, updateFeedback);
router.delete("/:id", protect, deleteFeedback);
router.get("/event/:eventId", protect, getEventFeedbacks);

// Organizer routes (protected by organizer auth)
router.get("/organizer/all", protectOrganizer, getOrganizerFeedbacks);
router.get("/organizer/event/:eventId/stats", protectOrganizer, getEventFeedbackStats);

export default router;