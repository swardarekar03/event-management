import express from "express";
import { 
    createEvent, 
    getEvents,
    singleEvent,
    updateEvent,
    deleteEvent
 } from "../controllers/eventController.js";

const router = express.Router();

router.post("/create-event", createEvent);
router.get("/", getEvents); 
router.get("/event-by-id", singleEvent);
router.put("/updated-event", updateEvent);
router.delete("/deleted-event", deleteEvent);

export default router;