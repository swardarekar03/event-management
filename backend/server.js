import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import startServer from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import ticketRoutes from "./src/routes/tickets.js";
import eventRoutes from "./src/routes/eventRoute.js";  
import organizerRoutes from "./src/routes/organizers.js";
import registerRotes from "./src/routes/registerRotes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/events", eventRoutes);       
app.use("/api/organizers", organizerRoutes);
app.use("/api/registerations", registerRotes);


// Base route
app.get("/", (req, res) => {
  res.send("Event Management System API is running...");
});

await startServer();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});