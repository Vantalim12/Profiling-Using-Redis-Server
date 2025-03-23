// redis-backend/src/routes/announcements.js - Updated implementation
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all announcements
router.get("/", async (req, res) => {
  try {
    // Get all announcements keys
    const keys = await req.redisClient.keys("announcement:*");
    console.log(`Found ${keys.length} announcements`);

    if (!keys.length) return res.json([]);

    // Get all announcements data
    const announcements = [];

    for (const key of keys) {
      const announcement = await req.redisClient.hGetAll(key);
      if (Object.keys(announcement).length > 0) {
        announcements.push(announcement);
      }
    }

    // Sort by date (newest first)
    announcements.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(announcements);
  } catch (error) {
    console.error("Error getting announcements:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific announcement
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await req.redisClient.hGetAll(`announcement:${id}`);

    if (!Object.keys(announcement).length) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(announcement);
  } catch (error) {
    console.error(`Error getting announcement ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new announcement
router.post(
  "/",
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("category").not().isEmpty().withMessage("Category is required"),
    body("type").not().isEmpty().withMessage("Type is required"),
    body("content").not().isEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Generate unique ID
      const id = uuidv4();
      const { title, category, type, content } = req.body;
      const date = new Date().toISOString();

      // Save the announcement to Redis with individual fields
      // FIXED: Use individual hSet calls for Redis 3.0 compatibility
      const key = `announcement:${id}`;
      await req.redisClient.hSet(key, "id", id);
      await req.redisClient.hSet(key, "title", title);
      await req.redisClient.hSet(key, "category", category);
      await req.redisClient.hSet(key, "type", type);
      await req.redisClient.hSet(key, "content", content);
      await req.redisClient.hSet(key, "date", date);

      console.log(`Created announcement with ID: ${id}`);

      // Prepare response
      const announcement = {
        id,
        title,
        category,
        type,
        content,
        date,
      };

      res.status(201).json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update an announcement
router.put(
  "/:id",
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("category").not().isEmpty().withMessage("Category is required"),
    body("type").not().isEmpty().withMessage("Type is required"),
    body("content").not().isEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const announcementExists = await req.redisClient.exists(
        `announcement:${id}`
      );

      if (!announcementExists) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      const { title, category, type, content } = req.body;

      // Update the announcement in Redis - fixed for Redis 3.0 compatibility
      const key = `announcement:${id}`;
      await req.redisClient.hSet(key, "title", title);
      await req.redisClient.hSet(key, "category", category);
      await req.redisClient.hSet(key, "type", type);
      await req.redisClient.hSet(key, "content", content);

      // Get the updated announcement
      const updatedAnnouncement = await req.redisClient.hGetAll(key);

      res.json(updatedAnnouncement);
    } catch (error) {
      console.error(`Error updating announcement ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete an announcement
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const announcementExists = await req.redisClient.exists(
      `announcement:${id}`
    );

    if (!announcementExists) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // Delete from Redis
    await req.redisClient.del(`announcement:${id}`);

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    console.error(`Error deleting announcement ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
