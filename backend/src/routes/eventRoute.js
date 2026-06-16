import express from "express";
import protect from "../middleware/authMiddleware.js";
import { 
    createEvent, 
    getEvents,
    singleEvent,
    updateEvent,
    deleteEvent,
    getMyEvents
 } from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);                  
router.post("/create-event", protect, createEvent);
router.get("/get-event/:id", protect, singleEvent);
router.put("/update-event/:id", protect, updateEvent);
router.delete("/delete-event/:id", protect, deleteEvent);
router.get("/getMyEvents", protect, getMyEvents);

export default router;