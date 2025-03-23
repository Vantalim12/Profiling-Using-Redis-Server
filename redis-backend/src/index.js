// src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("redis");
const authRoutes = require("./routes/auth");
const residentRoutes = require("./routes/residents");
const familyHeadRoutes = require("./routes/familyHeads");
const dashboardRoutes = require("./routes/dashboard");
const announcementRoutes = require("./routes/announcements");
const eventRoutes = require("./routes/events");
const documentRoutes = require("./routes/documents");
// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// Connect to Redis
(async () => {
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  // Initialize default data if not exists
  await initializeData();
})();

// Initialize sample data if not exists
async function initializeData() {
  const adminExists = await redisClient.exists("user:admin");

  if (!adminExists) {
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // In Redis 3.0, we need to set each field individually
    await redisClient.hSet("user:admin", "username", "admin");
    await redisClient.hSet("user:admin", "password", hashedPassword);
    await redisClient.hSet("user:admin", "role", "admin");
    await redisClient.hSet("user:admin", "name", "Juan Dela Cruz");

    console.log("Default admin user created");
  }

  // Check if at least some residents exist
  const residentsCount = await redisClient.get("residents:count");

  if (!residentsCount) {
    // Initialize residents count
    await redisClient.set("residents:count", "0");
    await redisClient.set("familyHeads:count", "0");

    console.log("Initialized resident and family head counts");
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Make Redis client available to routes
app.use((req, res, next) => {
  req.redisClient = redisClient;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/familyHeads", familyHeadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/documents", documentRoutes);
// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Barangay Management System API" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on("SIGINT", async () => {
  await redisClient.quit();
  console.log("Redis connection closed");
  process.exit(0);
});
