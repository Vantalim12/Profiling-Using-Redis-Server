// redis-backend/verify-data.js
require("dotenv").config();
const { createClient } = require("redis");

async function verifyRedisData() {
  console.log("Starting Redis data verification...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Check all data types
    console.log("\n=== CHECKING ALL DATA TYPES ===");

    // Check announcements
    const announcementKeys = await redisClient.keys("announcement:*");
    console.log(`Found ${announcementKeys.length} announcements`);
    if (announcementKeys.length > 0) {
      const sampleAnnouncement = await redisClient.hGetAll(announcementKeys[0]);
      console.log("Sample announcement:", sampleAnnouncement);
    } else {
      console.log("No announcements found. Creating a test announcement...");
      const testId = "test-" + Date.now();
      await redisClient.hSet(`announcement:${testId}`, "id", testId);
      await redisClient.hSet(
        `announcement:${testId}`,
        "title",
        "Test Announcement"
      );
      await redisClient.hSet(`announcement:${testId}`, "category", "Test");
      await redisClient.hSet(`announcement:${testId}`, "type", "Information");
      await redisClient.hSet(
        `announcement:${testId}`,
        "content",
        "This is a test announcement to verify Redis persistence."
      );
      await redisClient.hSet(
        `announcement:${testId}`,
        "date",
        new Date().toISOString()
      );
      console.log(`Created test announcement with ID: ${testId}`);
    }

    // Check events
    const eventKeys = await redisClient.keys("event:*");
    console.log(`Found ${eventKeys.length} events`);
    if (eventKeys.length > 0) {
      const sampleEvent = await redisClient.hGetAll(eventKeys[0]);
      console.log("Sample event:", sampleEvent);
    } else {
      console.log("No events found. Creating a test event...");
      const testId = "test-" + Date.now();
      await redisClient.hSet(`event:${testId}`, "id", testId);
      await redisClient.hSet(`event:${testId}`, "title", "Test Event");
      await redisClient.hSet(
        `event:${testId}`,
        "description",
        "This is a test event to verify Redis persistence."
      );
      await redisClient.hSet(
        `event:${testId}`,
        "eventDate",
        new Date(Date.now() + 86400000).toISOString()
      ); // Tomorrow
      await redisClient.hSet(`event:${testId}`, "location", "Test Location");
      await redisClient.hSet(`event:${testId}`, "category", "Test");
      await redisClient.hSet(
        `event:${testId}`,
        "createdDate",
        new Date().toISOString()
      );
      console.log(`Created test event with ID: ${testId}`);
    }

    // Check document requests
    const documentKeys = await redisClient.keys("documentRequest:*");
    console.log(`Found ${documentKeys.length} document requests`);
    if (documentKeys.length > 0) {
      const sampleDocument = await redisClient.hGetAll(documentKeys[0]);
      console.log("Sample document request:", sampleDocument);
    }

    // Verify Redis save configuration
    const saveConfig = await redisClient.configGet("save");
    console.log("\nRedis save configuration:", saveConfig);

    // Manually trigger a save to ensure all data is persisted
    await redisClient.save();
    console.log("Manually triggered Redis save");

    console.log("\nData verification completed successfully");
  } catch (error) {
    console.error("Error during data verification:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the verification function
verifyRedisData()
  .then(() => {
    console.log("Data verification complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });
