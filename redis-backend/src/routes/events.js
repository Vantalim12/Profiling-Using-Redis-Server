// redis-backend/src/routes/events.js - Updated implementation
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
        // Parse attendees from string to array if exists
        if (event.attendees) {
          try {
            event.attendees = JSON.parse(event.attendees);
          } catch (e) {
            console.error("Error parsing attendees:", e);
            event.attendees = [];
          }
        } else {
          event.attendees = [];
        }
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

    // Parse attendees from string to array if exists
    if (event.attendees) {
      try {
        event.attendees = JSON.parse(event.attendees);
      } catch (e) {
        console.error("Error parsing attendees:", e);
        event.attendees = [];
      }
    } else {
      event.attendees = [];
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
    body("time").not().isEmpty().withMessage("Time is required"),
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
      const { title, description, eventDate, location, category, time } =
        req.body;
      const createdDate = new Date().toISOString();

      // Initialize empty attendees array
      const attendees = [];

      // Save the event to Redis - fixed for Redis 3.0 compatibility
      const key = `event:${id}`;
      await req.redisClient.hSet(key, "id", id);
      await req.redisClient.hSet(key, "title", title);
      await req.redisClient.hSet(key, "description", description);
      await req.redisClient.hSet(key, "eventDate", eventDate);
      await req.redisClient.hSet(key, "location", location);
      await req.redisClient.hSet(key, "category", category);
      await req.redisClient.hSet(key, "time", time);
      await req.redisClient.hSet(key, "createdDate", createdDate);
      await req.redisClient.hSet(key, "attendees", JSON.stringify(attendees));

      console.log(`Created event with ID: ${id}`);

      // Prepare response
      const event = {
        id,
        title,
        description,
        eventDate,
        location,
        category,
        time,
        createdDate,
        attendees,
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
    body("time").optional(),
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

      // Get current event data for attendees
      const currentEvent = await req.redisClient.hGetAll(`event:${id}`);
      const { title, description, eventDate, location, category, time } =
        req.body;

      // Update the event in Redis - fixed for Redis 3.0 compatibility
      const key = `event:${id}`;
      await req.redisClient.hSet(key, "title", title);
      await req.redisClient.hSet(key, "description", description);
      await req.redisClient.hSet(key, "eventDate", eventDate);
      await req.redisClient.hSet(key, "location", location);
      await req.redisClient.hSet(key, "category", category);
      if (time) await req.redisClient.hSet(key, "time", time);

      // Get the updated event
      const updatedEvent = await req.redisClient.hGetAll(key);

      // Parse attendees from string to array
      if (updatedEvent.attendees) {
        try {
          updatedEvent.attendees = JSON.parse(updatedEvent.attendees);
        } catch (e) {
          console.error("Error parsing attendees:", e);
          updatedEvent.attendees = [];
        }
      } else {
        updatedEvent.attendees = [];
      }

      res.json(updatedEvent);
    } catch (error) {
      console.error(`Error updating event ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Register for an event
router.post(
  "/:id/register",
  [body("attendee").isObject().withMessage("Attendee information is required")],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { attendee } = req.body;

      // Validate required attendee fields
      if (!attendee.id || !attendee.name) {
        return res
          .status(400)
          .json({ error: "Attendee ID and name are required" });
      }

      const eventExists = await req.redisClient.exists(`event:${id}`);
      if (!eventExists) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Get current event data
      const event = await req.redisClient.hGetAll(`event:${id}`);

      // Parse existing attendees
      let attendees = [];
      if (event.attendees) {
        try {
          attendees = JSON.parse(event.attendees);
        } catch (e) {
          console.error("Error parsing attendees:", e);
          attendees = [];
        }
      }

      // Check if attendee is already registered
      const isRegistered = attendees.some((a) => a.id === attendee.id);
      if (isRegistered) {
        return res
          .status(400)
          .json({ error: "Attendee already registered for this event" });
      }

      // Add the new attendee
      attendees.push(attendee);

      // Update attendees in Redis
      await req.redisClient.hSet(
        `event:${id}`,
        "attendees",
        JSON.stringify(attendees)
      );

      res.status(200).json({ message: "Registration successful", attendees });
    } catch (error) {
      console.error(`Error registering for event ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Unregister from an event
router.delete("/:id/register/:attendeeId", async (req, res) => {
  try {
    const { id, attendeeId } = req.params;

    const eventExists = await req.redisClient.exists(`event:${id}`);
    if (!eventExists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Get current event data
    const event = await req.redisClient.hGetAll(`event:${id}`);

    // Parse existing attendees
    let attendees = [];
    if (event.attendees) {
      try {
        attendees = JSON.parse(event.attendees);
      } catch (e) {
        console.error("Error parsing attendees:", e);
        attendees = [];
      }
    }

    // Remove the attendee
    const filteredAttendees = attendees.filter((a) => a.id !== attendeeId);

    // Check if attendee was found
    if (filteredAttendees.length === attendees.length) {
      return res
        .status(404)
        .json({ error: "Attendee not registered for this event" });
    }

    // Update attendees in Redis
    await req.redisClient.hSet(
      `event:${id}`,
      "attendees",
      JSON.stringify(filteredAttendees)
    );

    res
      .status(200)
      .json({
        message: "Unregistration successful",
        attendees: filteredAttendees,
      });
  } catch (error) {
    console.error(`Error unregistering from event ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

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
