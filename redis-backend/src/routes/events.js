// redis-backend/src/routes/events.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all events
router.get("/", async (req, res) => {
  try {
    // Get all events keys
    const keys = await req.redisClient.keys("event:*");
    console.log(`Found ${keys.length} events`);

    if (!keys.length) return res.json([]);

    // Get all events data
    const events = [];

    for (const key of keys) {
      const event = await req.redisClient.hGetAll(key);
      if (Object.keys(event).length > 0) {
        events.push(event);
      }
    }

    // Sort by date (upcoming first)
    events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    res.json(events);
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific event
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await req.redisClient.hGetAll(`event:${id}`);

    if (!Object.keys(event).length) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    console.error(`Error getting event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new event
router.post(
  "/",
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("eventDate").isISO8601().withMessage("Valid event date is required"),
    body("location").not().isEmpty().withMessage("Location is required"),
    body("category").not().isEmpty().withMessage("Category is required"),
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
      const { title, description, eventDate, location, category } = req.body;
      const createdDate = new Date().toISOString();

      // Save the event to Redis
      await req.redisClient.hSet(`event:${id}`, "id", id);
      await req.redisClient.hSet(`event:${id}`, "title", title);
      await req.redisClient.hSet(`event:${id}`, "description", description);
      await req.redisClient.hSet(`event:${id}`, "eventDate", eventDate);
      await req.redisClient.hSet(`event:${id}`, "location", location);
      await req.redisClient.hSet(`event:${id}`, "category", category);
      await req.redisClient.hSet(`event:${id}`, "createdDate", createdDate);

      // Prepare response
      const event = {
        id,
        title,
        description,
        eventDate,
        location,
        category,
        createdDate,
      };

      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update an event
router.put(
  "/:id",
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("description").not().isEmpty().withMessage("Description is required"),
    body("eventDate").isISO8601().withMessage("Valid event date is required"),
    body("location").not().isEmpty().withMessage("Location is required"),
    body("category").not().isEmpty().withMessage("Category is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const eventExists = await req.redisClient.exists(`event:${id}`);

      if (!eventExists) {
        return res.status(404).json({ error: "Event not found" });
      }

      const { title, description, eventDate, location, category } = req.body;

      // Update the event in Redis
      await req.redisClient.hSet(`event:${id}`, "title", title);
      await req.redisClient.hSet(`event:${id}`, "description", description);
      await req.redisClient.hSet(`event:${id}`, "eventDate", eventDate);
      await req.redisClient.hSet(`event:${id}`, "location", location);
      await req.redisClient.hSet(`event:${id}`, "category", category);

      // Get the updated event
      const updatedEvent = await req.redisClient.hGetAll(`event:${id}`);

      res.json(updatedEvent);
    } catch (error) {
      console.error(`Error updating event ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete an event
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const eventExists = await req.redisClient.exists(`event:${id}`);

    if (!eventExists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Delete from Redis
    await req.redisClient.del(`event:${id}`);

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error(`Error deleting event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
