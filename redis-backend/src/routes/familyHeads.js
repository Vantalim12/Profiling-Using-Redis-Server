const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { generateId, getAllItems, getItemById } = require("../utils/redisUtils");
const util = require("util");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all family heads
router.get("/", async (req, res) => {
  try {
    const familyHeads = await getAllItems(req.redisClient, "familyHead:*");
    res.json(familyHeads);
  } catch (error) {
    console.error("Error getting family heads:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get family head by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const familyHead = await getItemById(req.redisClient, `familyHead:${id}`);

    if (!familyHead) {
      return res.status(404).json({ error: "Family head not found" });
    }

    res.json(familyHead);
  } catch (error) {
    console.error(`Error getting family head ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get family members for a family head
router.get("/:id/members", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if family head exists
    const familyHeadExists = await req.redisClient.exists(`familyHead:${id}`);
    if (!familyHeadExists) {
      return res.status(404).json({ error: "Family head not found" });
    }

    // Get member IDs
    const memberIds = await req.redisClient.sMembers(`familyMembers:${id}`);

    if (!memberIds.length) {
      return res.json([]);
    }

    // Get member details
    const members = await Promise.all(
      memberIds.map(async (memberId) => {
        return await req.redisClient.hGetAll(`resident:${memberId}`);
      })
    );

    res.json(members);
  } catch (error) {
    console.error(`Error getting family members for ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new family head
router.post(
  "/",
  [
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").isDate().withMessage("Valid birth date is required"),
    body("address").not().isEmpty().withMessage("Address is required"),
    body("contactNumber")
      .not()
      .isEmpty()
      .withMessage("Contact number is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Generate new family head ID
      const id = await generateId(req.redisClient, "familyHeads:count", "F");

      // Current registration date
      const registrationDate = new Date().toISOString();

      console.log("About to execute Redis hSet with key:", `familyHead:${id}`);

      try {
        // FIXED FOR REDIS 3.0: Set each field individually
        const key = `familyHead:${id}`;
        await req.redisClient.hSet(key, "id", id);
        await req.redisClient.hSet(key, "firstName", req.body.firstName);
        await req.redisClient.hSet(key, "lastName", req.body.lastName);
        await req.redisClient.hSet(key, "gender", req.body.gender);
        await req.redisClient.hSet(key, "birthDate", req.body.birthDate);
        await req.redisClient.hSet(key, "address", req.body.address);
        await req.redisClient.hSet(
          key,
          "contactNumber",
          req.body.contactNumber
        );
        await req.redisClient.hSet(key, "registrationDate", registrationDate);
        await req.redisClient.hSet(key, "type", "Family Head");

        console.log("Redis hSet commands executed successfully");
      } catch (error) {
        console.error("Redis hSet error details:", error);
        throw error;
      }

      // Initialize empty set for family members
      await req.redisClient.sAdd(`familyMembers:${id}`, "");
      await req.redisClient.sRem(`familyMembers:${id}`, "");

      // Prepare response data
      const familyHead = {
        id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        address: req.body.address,
        contactNumber: req.body.contactNumber,
        registrationDate: registrationDate,
        type: "Family Head",
      };

      res.status(201).json(familyHead);
    } catch (error) {
      console.error("Error creating family head:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update family head
router.put(
  "/:id",
  [
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").isDate().withMessage("Valid birth date is required"),
    body("address").not().isEmpty().withMessage("Address is required"),
    body("contactNumber")
      .not()
      .isEmpty()
      .withMessage("Contact number is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;

      // Check if family head exists
      const familyHeadExists = await req.redisClient.exists(`familyHead:${id}`);
      if (!familyHeadExists) {
        return res.status(404).json({ error: "Family head not found" });
      }

      // Get current family head data
      const currentFamilyHead = await req.redisClient.hGetAll(
        `familyHead:${id}`
      );

      // FIXED FOR REDIS 3.0: Update family head in Redis - set each field individually
      const key = `familyHead:${id}`;
      await req.redisClient.hSet(key, "id", id);
      await req.redisClient.hSet(key, "firstName", req.body.firstName);
      await req.redisClient.hSet(key, "lastName", req.body.lastName);
      await req.redisClient.hSet(key, "gender", req.body.gender);
      await req.redisClient.hSet(key, "birthDate", req.body.birthDate);
      await req.redisClient.hSet(key, "address", req.body.address);
      await req.redisClient.hSet(key, "contactNumber", req.body.contactNumber);
      await req.redisClient.hSet(
        key,
        "registrationDate",
        currentFamilyHead.registrationDate || new Date().toISOString()
      );
      await req.redisClient.hSet(key, "type", "Family Head");

      // Update address for all family members if address changed
      if (req.body.address !== currentFamilyHead.address) {
        const memberIds = await req.redisClient.sMembers(`familyMembers:${id}`);

        for (const memberId of memberIds) {
          const member = await req.redisClient.hGetAll(`resident:${memberId}`);

          // FIXED FOR REDIS 3.0: Update member address - set field individually
          await req.redisClient.hSet(
            `resident:${memberId}`,
            "address",
            req.body.address
          );
        }
      }

      // Prepare response data
      const familyHead = {
        id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        address: req.body.address,
        contactNumber: req.body.contactNumber,
        registrationDate:
          currentFamilyHead.registrationDate || new Date().toISOString(),
        type: "Family Head",
      };

      res.json(familyHead);
    } catch (error) {
      console.error(`Error updating family head ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete family head
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if family head exists
    const familyHeadExists = await req.redisClient.exists(`familyHead:${id}`);
    if (!familyHeadExists) {
      return res.status(404).json({ error: "Family head not found" });
    }

    // Get family members
    const memberIds = await req.redisClient.sMembers(`familyMembers:${id}`);

    if (memberIds.length > 0) {
      return res.status(400).json({
        error:
          "Cannot delete family head with existing members. Please reassign or delete members first.",
      });
    }

    // Delete family head from Redis
    await req.redisClient.del(`familyHead:${id}`);

    // Delete family members set
    await req.redisClient.del(`familyMembers:${id}`);

    res.json({ message: "Family head deleted successfully" });
  } catch (error) {
    console.error(`Error deleting family head ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
