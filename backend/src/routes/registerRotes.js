import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  registerForEvent,
  getMyRegistrations,
  getEventRegistrations,
  checkInAttendee,
  getRegistrationById,
  getOrganizerRegistrations,
} from "../controllers/registerController.js";

const router = express.Router();

router.use(protect);

router.post("/register", registerForEvent);
router.get("/organizer", getOrganizerRegistrations);
router.get("/", getMyRegistrations);
router.get("/event/:eventId", getEventRegistrations);
router.put("/checkin/:id", checkInAttendee);
router.get("/:id", getRegistrationById);

export default router;