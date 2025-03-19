// src/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { authenticateToken, isAdmin } = require("../middleware/auth");

// Login route
router.post(
  "/login",
  [
    body("username").not().isEmpty().withMessage("Username is required"),
    body("password").not().isEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if user exists
      const user = await req.redisClient.hGetAll(`user:${username}`);

      // Add debug logging
      console.log("User data retrieved:", {
        username,
        userExists: Object.keys(user).length > 0,
        hasPassword: !!user.password,
      });

      if (!Object.keys(user).length) {
        return res.status(400).json({ error: "Invalid username or password" });
      }

      // Check if password field exists
      if (!user.password) {
        console.error("User found but password field is missing");
        return res.status(500).json({ error: "Server error during login" });
      }

      // Check password with null safety
      const validPassword = user.password
        ? await bcrypt.compare(password, user.password)
        : false;
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid username or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          username: user.username,
          name: user.name,
          role: user.role,
          residentId: user.residentId, // Include residentId if user is a resident
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );

      res.json({
        token,
        user: {
          username: user.username,
          name: user.name,
          role: user.role,
          residentId: user.residentId, // Include residentId if user is a resident
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error during login" });
    }
  }
);

// Get current user route
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const { username } = req.user;

    // Get user details from Redis (excluding password)
    const user = await req.redisClient.hGetAll(`user:${username}`);

    if (!Object.keys(user).length) {
      return res.status(404).json({ error: "User not found" });
    }

    // Don't send password to client
    delete user.password;

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Change password route
router.post(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .not()
      .isEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const { username } = req.user;

    try {
      // Get user from Redis
      const user = await req.redisClient.hGetAll(`user:${username}`);

      if (!Object.keys(user).length) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if password field exists
      if (!user.password) {
        console.error("User found but password field is missing");
        return res
          .status(500)
          .json({ error: "Server error during password change" });
      }

      // Verify current password with null safety
      const validPassword = user.password
        ? await bcrypt.compare(currentPassword, user.password)
        : false;

      if (!validPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password in Redis - Redis 3.0 compatible
      await req.redisClient.hSet(
        `user:${username}`,
        "password",
        hashedPassword
      );

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// New Route: Register resident user (Redis 3.0 compatible)
router.post(
  "/register",
  [
    body("username").not().isEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("name").not().isEmpty().withMessage("Name is required"),
    body("residentId").not().isEmpty().withMessage("Resident ID is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password, name, residentId } = req.body;

    try {
      // Check if username already exists
      const userExists = await req.redisClient.exists(`user:${username}`);
      if (userExists) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if resident exists
      const residentExists = await req.redisClient.exists(
        `resident:${residentId}`
      );
      if (!residentExists) {
        return res.status(400).json({ error: "Resident ID not found" });
      }

      // Check if resident already has an account
      const userWithResidentId = await req.redisClient.keys("user:*");
      for (const userKey of userWithResidentId) {
        const user = await req.redisClient.hGetAll(userKey);
        if (user.residentId === residentId) {
          return res
            .status(400)
            .json({ error: "Resident already has an account" });
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user in Redis - REDIS 3.0 COMPATIBLE VERSION
      // Set each field individually
      const userKey = `user:${username}`;
      await req.redisClient.hSet(userKey, "username", username);
      await req.redisClient.hSet(userKey, "password", hashedPassword);
      await req.redisClient.hSet(userKey, "name", name);
      await req.redisClient.hSet(userKey, "role", "resident");
      await req.redisClient.hSet(userKey, "residentId", residentId);

      // Generate JWT token
      const token = jwt.sign(
        {
          username,
          name,
          role: "resident",
          residentId,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );

      res.status(201).json({
        token,
        user: {
          username,
          name,
          role: "resident",
          residentId,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  }
);

// New route: Check if resident already has an account (Redis 3.0 compatible)
router.get("/check-resident/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resident exists
    const residentExists = await req.redisClient.exists(`resident:${id}`);
    if (!residentExists) {
      return res.status(404).json({ error: "Resident not found" });
    }

    // Check if resident already has an account
    const userKeys = await req.redisClient.keys("user:*");
    let hasAccount = false;

    for (const userKey of userKeys) {
      const user = await req.redisClient.hGetAll(userKey);
      if (user.residentId === id) {
        hasAccount = true;
        break;
      }
    }

    res.json({ hasAccount });
  } catch (error) {
    console.error("Error checking resident:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
