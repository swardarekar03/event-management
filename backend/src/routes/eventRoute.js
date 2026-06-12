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
router.get("/get-events", getEvents); 
router.get("/get-event/:id", singleEvent);
router.put("/update-event/:id", updateEvent);
router.delete("/delete-event/:id", deleteEvent);

export default router;