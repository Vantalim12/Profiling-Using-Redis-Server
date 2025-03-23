// Create this as redis-backend/test-create-announcement.js
require("dotenv").config();
const { createClient } = require("redis");
const { v4: uuidv4 } = require("uuid");

async function testCreateAnnouncement() {
  console.log("Testing announcement creation...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Create a test announcement
    const id = uuidv4();
    const title = "Test Announcement " + new Date().toLocaleTimeString();
    const category = "Test";
    const type = "Information";
    const content =
      "This is a test announcement created at " + new Date().toLocaleString();
    const date = new Date().toISOString();

    console.log(`Creating announcement: "${title}"`);

    // Save the announcement to Redis
    await redisClient.hSet(`announcement:${id}`, "id", id);
    await redisClient.hSet(`announcement:${id}`, "title", title);
    await redisClient.hSet(`announcement:${id}`, "category", category);
    await redisClient.hSet(`announcement:${id}`, "type", type);
    await redisClient.hSet(`announcement:${id}`, "content", content);
    await redisClient.hSet(`announcement:${id}`, "date", date);

    console.log("Announcement created successfully");

    // Get all announcements
    const keys = await redisClient.keys("announcement:*");
    console.log(`Found ${keys.length} total announcements`);

    // Display them
    if (keys.length > 0) {
      console.log("\nCurrent announcements:");
      for (const key of keys) {
        const announcement = await redisClient.hGetAll(key);
        console.log(
          `- ${announcement.title} (${
            announcement.type
          }): ${announcement.content.substring(0, 30)}...`
        );
      }
    }
  } catch (error) {
    console.error("Error creating announcement:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the test
testCreateAnnouncement()
  .then(() => {
    console.log("Test complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
