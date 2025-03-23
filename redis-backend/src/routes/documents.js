// redis-backend/src/routes/documents.js - Updated implementation
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all document requests (admin access or filtered by role)
router.get("/", async (req, res) => {
  try {
    // Get all document request keys
    const keys = await req.redisClient.keys("documentRequest:*");
    console.log(`Found ${keys.length} document requests`);

    if (!keys.length) return res.json([]);

    // Get all document requests data
    const requests = [];

    for (const key of keys) {
      const request = await req.redisClient.hGetAll(key);
      if (Object.keys(request).length > 0) {
        // If user is not admin, only show their own requests
        if (
          req.user.role !== "admin" &&
          req.user.residentId !== request.residentId
        ) {
          continue;
        }
        requests.push(request);
      }
    }

    // Sort by date (newest first)
    requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    res.json(requests);
  } catch (error) {
    console.error("Error getting document requests:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get document requests for a specific resident
router.get("/resident/:residentId", async (req, res) => {
  try {
    const { residentId } = req.params;

    // Verify permission - only admin or the resident themselves can access
    if (req.user.role !== "admin" && req.user.residentId !== residentId) {
      return res
        .status(403)
        .json({ error: "Not authorized to access these requests" });
    }

    // Get all document request keys
    const keys = await req.redisClient.keys("documentRequest:*");
    if (!keys.length) return res.json([]);

    // Filter requests for this resident
    const requests = [];

    for (const key of keys) {
      const request = await req.redisClient.hGetAll(key);
      if (
        Object.keys(request).length > 0 &&
        request.residentId === residentId
      ) {
        requests.push(request);
      }
    }

    // Sort by date (newest first)
    requests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    res.json(requests);
  } catch (error) {
    console.error(
      `Error getting document requests for resident ${req.params.residentId}:`,
      error
    );
    res.status(500).json({ error: "Server error" });
  }
});

// Get a specific document request
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const request = await req.redisClient.hGetAll(`documentRequest:${id}`);

    if (!Object.keys(request).length) {
      return res.status(404).json({ error: "Document request not found" });
    }

    // Verify permission - only admin or the resident themselves can access
    if (
      req.user.role !== "admin" &&
      req.user.residentId !== request.residentId
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this request" });
    }

    res.json(request);
  } catch (error) {
    console.error(`Error getting document request ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a new document request
router.post(
  "/",
  [
    body("residentId").not().isEmpty().withMessage("Resident ID is required"),
    body("documentType")
      .not()
      .isEmpty()
      .withMessage("Document type is required"),
    body("purpose").not().isEmpty().withMessage("Purpose is required"),
    body("deliveryOption")
      .not()
      .isEmpty()
      .withMessage("Delivery option is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if the user is requesting for themselves or admin is requesting for someone
      if (
        req.user.role !== "admin" &&
        req.user.residentId !== req.body.residentId
      ) {
        return res
          .status(403)
          .json({ error: "You can only create requests for yourself" });
      }

      // Generate unique ID and requestId
      const id = uuidv4();
      const requestId = `REQ-${new Date().getFullYear()}${String(
        Math.floor(Math.random() * 1000)
      ).padStart(3, "0")}`;

      const {
        residentId,
        documentType,
        purpose,
        deliveryOption,
        additionalDetails,
      } = req.body;
      const requestDate = new Date().toISOString();

      // Get resident details for the name
      const resident = await req.redisClient.hGetAll(`resident:${residentId}`);
      let residentName = "Unknown";

      if (Object.keys(resident).length > 0) {
        residentName = `${resident.firstName} ${resident.lastName}`;
      } else {
        console.warn(
          `Resident ${residentId} not found when creating document request`
        );
      }

      // Default status is "Pending"
      const status = "pending";

      // Save the document request to Redis - fixed for Redis 3.0 compatibility
      const key = `documentRequest:${id}`;
      await req.redisClient.hSet(key, "id", id);
      await req.redisClient.hSet(key, "requestId", requestId);
      await req.redisClient.hSet(key, "residentId", residentId);
      await req.redisClient.hSet(key, "residentName", residentName);
      await req.redisClient.hSet(key, "documentType", documentType);
      await req.redisClient.hSet(key, "purpose", purpose);
      await req.redisClient.hSet(
        key,
        "additionalDetails",
        additionalDetails || ""
      );
      await req.redisClient.hSet(key, "status", status);
      await req.redisClient.hSet(key, "requestDate", requestDate);
      await req.redisClient.hSet(key, "deliveryOption", deliveryOption);
      await req.redisClient.hSet(key, "processingDate", "");
      await req.redisClient.hSet(key, "processingNotes", "");

      console.log(
        `Created document request: ${requestId} for resident ${residentId}`
      );

      // Prepare response
      const documentRequest = {
        id,
        requestId,
        residentId,
        residentName,
        documentType,
        purpose,
        additionalDetails: additionalDetails || "",
        status,
        requestDate,
        deliveryOption,
        processingDate: "",
        processingNotes: "",
      };

      res.status(201).json(documentRequest);
    } catch (error) {
      console.error("Error creating document request:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update a document request status (admin only)
router.put(
  "/:id/status",
  [
    body("status")
      .isIn(["pending", "approved", "rejected", "completed"])
      .withMessage("Invalid status"),
    body("processingNotes").optional(),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { status, processingNotes } = req.body;

      // Only admin can update status
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only admins can update document request status" });
      }

      // Check if request exists
      const requestExists = await req.redisClient.exists(
        `documentRequest:${id}`
      );
      if (!requestExists) {
        return res.status(404).json({ error: "Document request not found" });
      }

      // Get current request data
      const currentRequest = await req.redisClient.hGetAll(
        `documentRequest:${id}`
      );

      // Update the request in Redis - fixed for Redis 3.0 compatibility
      const key = `documentRequest:${id}`;
      await req.redisClient.hSet(key, "status", status);
      await req.redisClient.hSet(
        key,
        "processingDate",
        new Date().toISOString()
      );
      await req.redisClient.hSet(key, "processingNotes", processingNotes || "");
      await req.redisClient.hSet(key, "processedBy", req.user.username);

      // Get the updated request
      const updatedRequest = await req.redisClient.hGetAll(key);

      res.json(updatedRequest);
    } catch (error) {
      console.error(`Error updating document request ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete a document request
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get current request to check ownership
    const documentRequest = await req.redisClient.hGetAll(
      `documentRequest:${id}`
    );

    if (!Object.keys(documentRequest).length) {
      return res.status(404).json({ error: "Document request not found" });
    }

    // Only allow the resident who made the request or an admin to delete it
    if (
      req.user.role !== "admin" &&
      req.user.residentId !== documentRequest.residentId
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this request" });
    }

    // Delete from Redis
    await req.redisClient.del(`documentRequest:${id}`);

    res.json({ message: "Document request deleted successfully" });
  } catch (error) {
    console.error(`Error deleting document request ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
