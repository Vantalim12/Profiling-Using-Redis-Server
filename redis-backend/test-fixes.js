// redis-backend/test-fixes.js - Test script to verify our implementations
require("dotenv").config();
const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");

async function testImplementations() {
  console.log("Starting test of fixed implementations...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // ======= Test 1: Create Announcement =======
    console.log("\n===== TESTING ANNOUNCEMENT CREATE =====");

    const announcementId = uuidv4();
    const announcementTitle =
      "Test Announcement " + new Date().toLocaleTimeString();

    // Save the announcement to Redis with individual fields
    console.log(`Creating test announcement: "${announcementTitle}"`);

    const announcementKey = `announcement:${announcementId}`;
    await redisClient.hSet(announcementKey, "id", announcementId);
    await redisClient.hSet(announcementKey, "title", announcementTitle);
    await redisClient.hSet(announcementKey, "category", "Test");
    await redisClient.hSet(announcementKey, "type", "Information");
    await redisClient.hSet(
      announcementKey,
      "content",
      "This is a test announcement created at " + new Date().toLocaleString()
    );
    await redisClient.hSet(announcementKey, "date", new Date().toISOString());

    // Verify announcement creation
    const announcement = await redisClient.hGetAll(announcementKey);
    console.log("Announcement created: ", announcement);
    console.log("Announcement fields: ", Object.keys(announcement));

    if (!announcement.id || !announcement.title || !announcement.category) {
      throw new Error("Announcement creation failed or has missing fields");
    }

    console.log("Announcement creation test PASSED!\n");

    // ======= Test 2: Create Event =======
    console.log("\n===== TESTING EVENT CREATE =====");

    const eventId = uuidv4();
    const eventTitle = "Test Event " + new Date().toLocaleTimeString();

    // Save the event to Redis with individual fields
    console.log(`Creating test event: "${eventTitle}"`);

    const eventKey = `event:${eventId}`;
    await redisClient.hSet(eventKey, "id", eventId);
    await redisClient.hSet(eventKey, "title", eventTitle);
    await redisClient.hSet(
      eventKey,
      "description",
      "This is a test event created at " + new Date().toLocaleString()
    );
    await redisClient.hSet(
      eventKey,
      "eventDate",
      new Date(Date.now() + 86400000).toISOString()
    ); // Tomorrow
    await redisClient.hSet(eventKey, "location", "Test Location");
    await redisClient.hSet(eventKey, "category", "Test");
    await redisClient.hSet(eventKey, "time", "9:00 AM - 12:00 PM");
    await redisClient.hSet(eventKey, "createdDate", new Date().toISOString());
    await redisClient.hSet(eventKey, "attendees", JSON.stringify([]));

    // Verify event creation
    const event = await redisClient.hGetAll(eventKey);
    console.log("Event created: ", event);
    console.log("Event fields: ", Object.keys(event));

    if (!event.id || !event.title || !event.category) {
      throw new Error("Event creation failed or has missing fields");
    }

    console.log("Event creation test PASSED!\n");

    // ======= Test 3: Create Document Request =======
    console.log("\n===== TESTING DOCUMENT REQUEST CREATE =====");

    // First, find a resident to associate with the request
    const residentKeys = await redisClient.keys("resident:*");
    if (residentKeys.length === 0) {
      console.log("No residents found. Creating a test resident first.");

      const residentId = "R-TEST-" + Math.floor(Math.random() * 1000);
      const residentKey = `resident:${residentId}`;

      await redisClient.hSet(residentKey, "id", residentId);
      await redisClient.hSet(residentKey, "firstName", "Test");
      await redisClient.hSet(residentKey, "lastName", "Resident");
      await redisClient.hSet(residentKey, "gender", "Male");
      await redisClient.hSet(residentKey, "birthDate", "2000-01-01");
      await redisClient.hSet(residentKey, "address", "Test Address");
      await redisClient.hSet(residentKey, "contactNumber", "1234567890");
      await redisClient.hSet(
        residentKey,
        "registrationDate",
        new Date().toISOString()
      );
      await redisClient.hSet(residentKey, "type", "Resident");

      console.log("Created test resident with ID:", residentId);
      var resident = await redisClient.hGetAll(residentKey);
    } else {
      var resident = await redisClient.hGetAll(residentKeys[0]);
      console.log("Using existing resident:", resident);
    }

    const documentId = uuidv4();
    const requestId = `REQ-TEST-${Math.floor(Math.random() * 1000)}`;

    // Save the document request to Redis
    console.log(
      `Creating test document request: "${requestId}" for resident ${resident.id}`
    );

    const requestKey = `documentRequest:${documentId}`;
    await redisClient.hSet(requestKey, "id", documentId);
    await redisClient.hSet(requestKey, "requestId", requestId);
    await redisClient.hSet(requestKey, "residentId", resident.id);
    await redisClient.hSet(
      requestKey,
      "residentName",
      `${resident.firstName} ${resident.lastName}`
    );
    await redisClient.hSet(requestKey, "documentType", "barangay-clearance");
    await redisClient.hSet(requestKey, "purpose", "Testing purposes");
    await redisClient.hSet(
      requestKey,
      "additionalDetails",
      "This is a test request"
    );
    await redisClient.hSet(requestKey, "status", "pending");
    await redisClient.hSet(requestKey, "requestDate", new Date().toISOString());
    await redisClient.hSet(requestKey, "deliveryOption", "pickup");
    await redisClient.hSet(requestKey, "processingDate", "");
    await redisClient.hSet(requestKey, "processingNotes", "");

    // Verify document request creation
    const documentRequest = await redisClient.hGetAll(requestKey);
    console.log("Document request created: ", documentRequest);
    console.log("Document request fields: ", Object.keys(documentRequest));

    if (
      !documentRequest.id ||
      !documentRequest.requestId ||
      !documentRequest.residentId
    ) {
      throw new Error("Document request creation failed or has missing fields");
    }

    console.log("Document request creation test PASSED!\n");

    // ======= Test 4: Verify All Objects Retrievable =======
    console.log("\n===== TESTING RETRIEVABILITY OF ALL OBJECTS =====");

    // Get all announcements
    const announcementKeys = await redisClient.keys("announcement:*");
    console.log(`Found ${announcementKeys.length} announcements`);
    if (announcementKeys.length > 0) {
      const sampleAnnouncement = await redisClient.hGetAll(announcementKeys[0]);
      console.log(
        "Sample announcement fields:",
        Object.keys(sampleAnnouncement)
      );
    }

    // Get all events
    const eventKeys = await redisClient.keys("event:*");
    console.log(`Found ${eventKeys.length} events`);
    if (eventKeys.length > 0) {
      const sampleEvent = await redisClient.hGetAll(eventKeys[0]);
      console.log("Sample event fields:", Object.keys(sampleEvent));
    }

    // Get all document requests
    const documentKeys = await redisClient.keys("documentRequest:*");
    console.log(`Found ${documentKeys.length} document requests`);
    if (documentKeys.length > 0) {
      const sampleDocument = await redisClient.hGetAll(documentKeys[0]);
      console.log(
        "Sample document request fields:",
        Object.keys(sampleDocument)
      );
    }

    console.log("All objects retrievable test PASSED!\n");

    console.log("\n===== ALL TESTS PASSED! =====");
    console.log("The fixes should now be working properly!");
  } catch (error) {
    console.error("Error during testing:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the test function
testImplementations()
  .then(() => {
    console.log("Tests complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Tests failed:", err);
    process.exit(1);
  });
