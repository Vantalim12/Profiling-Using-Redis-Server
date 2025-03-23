// redis-backend/src/routes/documents.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all document requests
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
      const { residentId, documentType, purpose, additionalDetails } = req.body;
      const requestDate = new Date().toISOString();

      // Get resident details
      const resident = await req.redisClient.hGetAll(`resident:${residentId}`);
      if (!Object.keys(resident).length) {
        return res.status(400).json({ error: "Resident not found" });
      }

      // Default status is "Pending"
      const status = "Pending";

      // Save the document request to Redis
      await req.redisClient.hSet(`documentRequest:${id}`, "id", id);
      await req.redisClient.hSet(
        `documentRequest:${id}`,
        "residentId",
        residentId
      );
      await req.redisClient.hSet(
        `documentRequest:${id}`,
        "residentName",
        `${resident.firstName} ${resident.lastName}`
      );
      await req.redisClient.hSet(
        `documentRequest:${id}`,
        "documentType",
        documentType
      );
      await req.redisClient.hSet(`documentRequest:${id}`, "purpose", purpose);
      await req.redisClient.hSet(
        `documentRequest:${id}`,
        "additionalDetails",
        additionalDetails || ""
      );
      await req.redisClient.hSet(`documentRequest:${id}`, "status", status);
      await req.redisClient.hSet(
        `documentRequest:${id}`,
        "requestDate",
        requestDate
      );
      await req.redisClient.hSet(`documentRequest:${id}`, "processingDate", "");
      await req.redisClient.hSet(
        `documentRequest:${id}`,
        "processingNotes",
        ""
      );

      // Prepare response
      const documentRequest = {
        id,
        residentId,
        residentName: `${resident.firstName} ${resident.lastName}`,
        documentType,
        purpose,
        additionalDetails: additionalDetails || "",
        status,
        requestDate,
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
      .isIn(["Pending", "Approved", "Rejected", "Completed"])
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

      // Update the request in Redis
      await req.redisClient.hSet(`documentRequest:${id}`, "status", status);
      await req.redisClient.hSet(
        `documentRequest:${id}`,
        "processingDate",
        new Date().toISOString()
      );
      await req.redisClient.hSet(
        `documentRequest:${id}`,
        "processingNotes",
        processingNotes || ""
      );

      // Get the updated request
      const updatedRequest = await req.redisClient.hGetAll(
        `documentRequest:${id}`
      );

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
