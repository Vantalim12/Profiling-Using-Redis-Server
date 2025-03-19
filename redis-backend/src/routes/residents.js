const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { generateId, getAllItems, getItemById } = require("../utils/redisUtils");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all residents
router.get("/", async (req, res) => {
  try {
    const residents = await getAllItems(req.redisClient, "resident:*");
    // FIXED: Added debug logging
    console.log("Retrieved residents:", residents);
    res.json(residents);
  } catch (error) {
    console.error("Error getting residents:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get resident by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resident = await getItemById(req.redisClient, `resident:${id}`);

    if (!resident) {
      return res.status(404).json({ error: "Resident not found" });
    }

    res.json(resident);
  } catch (error) {
    console.error(`Error getting resident ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new resident
router.post(
  "/",
  [
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").isDate().withMessage("Valid birth date is required"),
    body("address").not().isEmpty().withMessage("Address is required"),
    body("contactNumber").optional(),
    body("familyHeadId").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if family head exists if provided
      if (req.body.familyHeadId) {
        const familyHeadExists = await req.redisClient.exists(
          `familyHead:${req.body.familyHeadId}`
        );
        if (!familyHeadExists) {
          return res.status(400).json({ error: "Family head does not exist" });
        }
      }

      // Generate new resident ID
      const id = await generateId(req.redisClient, "residents:count", "R");

      // Current registration date
      const registrationDate = new Date().toISOString();

      // Log before saving
      console.log("About to execute Redis hSet with key:", `resident:${id}`);

      // FIXED FOR REDIS 3.0: Save resident to Redis with individual hSet calls
      const key = `resident:${id}`;
      await req.redisClient.hSet(key, "id", id);
      await req.redisClient.hSet(key, "firstName", req.body.firstName);
      await req.redisClient.hSet(key, "lastName", req.body.lastName);
      await req.redisClient.hSet(key, "gender", req.body.gender);
      await req.redisClient.hSet(key, "birthDate", req.body.birthDate);
      await req.redisClient.hSet(key, "address", req.body.address);
      await req.redisClient.hSet(
        key,
        "contactNumber",
        req.body.contactNumber || ""
      );
      await req.redisClient.hSet(
        key,
        "familyHeadId",
        req.body.familyHeadId || ""
      );
      await req.redisClient.hSet(key, "registrationDate", registrationDate);
      await req.redisClient.hSet(key, "type", "Resident");

      console.log("Redis hSet commands executed successfully");

      // If this resident is part of a family, update family members
      if (req.body.familyHeadId) {
        console.log(`Adding resident ${id} to family ${req.body.familyHeadId}`);
        await req.redisClient.sAdd(
          `familyMembers:${req.body.familyHeadId}`,
          id
        );
      }

      // Prepare response data
      const resident = {
        id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        address: req.body.address,
        contactNumber: req.body.contactNumber || "",
        familyHeadId: req.body.familyHeadId || "",
        registrationDate: registrationDate,
        type: "Resident",
      };

      res.status(201).json(resident);
    } catch (error) {
      console.error("Error creating resident:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update resident
router.put(
  "/:id",
  [
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").isDate().withMessage("Valid birth date is required"),
    body("address").not().isEmpty().withMessage("Address is required"),
    body("contactNumber").optional(),
    body("familyHeadId").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;

      // Check if resident exists
      const residentExists = await req.redisClient.exists(`resident:${id}`);
      if (!residentExists) {
        return res.status(404).json({ error: "Resident not found" });
      }

      // Get current resident data
      const currentResident = await req.redisClient.hGetAll(`resident:${id}`);

      // If family head changed, update family memberships
      if (
        currentResident.familyHeadId &&
        currentResident.familyHeadId !== req.body.familyHeadId
      ) {
        // Remove from old family
        console.log(
          `Removing resident ${id} from family ${currentResident.familyHeadId}`
        );
        await req.redisClient.sRem(
          `familyMembers:${currentResident.familyHeadId}`,
          id
        );
      }

      // Check if new family head exists
      if (req.body.familyHeadId) {
        const familyHeadExists = await req.redisClient.exists(
          `familyHead:${req.body.familyHeadId}`
        );
        if (!familyHeadExists) {
          return res.status(400).json({ error: "Family head does not exist" });
        }

        // Add to new family
        console.log(`Adding resident ${id} to family ${req.body.familyHeadId}`);
        await req.redisClient.sAdd(
          `familyMembers:${req.body.familyHeadId}`,
          id
        );
      }

      // FIXED FOR REDIS 3.0: Update resident in Redis with individual hSet calls
      const key = `resident:${id}`;
      await req.redisClient.hSet(key, "id", id);
      await req.redisClient.hSet(key, "firstName", req.body.firstName);
      await req.redisClient.hSet(key, "lastName", req.body.lastName);
      await req.redisClient.hSet(key, "gender", req.body.gender);
      await req.redisClient.hSet(key, "birthDate", req.body.birthDate);
      await req.redisClient.hSet(key, "address", req.body.address);
      await req.redisClient.hSet(
        key,
        "contactNumber",
        req.body.contactNumber || ""
      );
      await req.redisClient.hSet(
        key,
        "familyHeadId",
        req.body.familyHeadId || ""
      );
      await req.redisClient.hSet(
        key,
        "registrationDate",
        currentResident.registrationDate || new Date().toISOString()
      );
      await req.redisClient.hSet(key, "type", "Resident");

      // Prepare response data
      const resident = {
        id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        birthDate: req.body.birthDate,
        address: req.body.address,
        contactNumber: req.body.contactNumber || "",
        familyHeadId: req.body.familyHeadId || "",
        registrationDate:
          currentResident.registrationDate || new Date().toISOString(),
        type: "Resident",
      };

      res.json(resident);
    } catch (error) {
      console.error(`Error updating resident ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete resident
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resident exists
    const residentExists = await req.redisClient.exists(`resident:${id}`);
    if (!residentExists) {
      return res.status(404).json({ error: "Resident not found" });
    }

    // Get resident data
    const resident = await req.redisClient.hGetAll(`resident:${id}`);

    // If resident is part of a family, remove from family members
    if (resident.familyHeadId) {
      console.log(
        `Removing resident ${id} from family ${resident.familyHeadId}`
      );
      await req.redisClient.sRem(`familyMembers:${resident.familyHeadId}`, id);
    }

    // Delete resident from Redis
    await req.redisClient.del(`resident:${id}`);

    res.json({ message: "Resident deleted successfully" });
  } catch (error) {
    console.error(`Error deleting resident ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
