import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import startServer from "./src/config/db.js";

import authRoutes from "./src/routes/auth.js";
import ticketRoutes from "./src/routes/tickets.js";
import eventRoutes from "./src/routes/eventRoute.js";
import organizerRoutes from "./src/routes/organizerRoutes.js";
import registrationRoutes from "./src/routes/registerRotes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import imageRoutes from "./src/routes/imageRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import feedbackRoutes from "./src/routes/feedbackRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed frontend URLs
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://nexeventmanagement.vercel.app",
];

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);

      // Allow exact matches
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployment URLs (e.g. nexeventmanagement-git-branch-xyz.vercel.app)
      if (/\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/feedback", feedbackRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Event Management System API is running...");
});

// Start DB and server
await startServer();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
