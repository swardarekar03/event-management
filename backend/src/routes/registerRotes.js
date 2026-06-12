import express from "express";
import {
  registerForEvent,
  getRegistrations,
  getEventRegistrations,
  checkInAttendee,
} from "../controllers/registrationController.js";

const router = express.Router();

router.post("/register", registerForEvent);

router.get("/", getRegistrations);

router.get("/event/:eventId", getEventRegistrations);

router.put("/checkin/:id", checkInAttendee);

export default router;