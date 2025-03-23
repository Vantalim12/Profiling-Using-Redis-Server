// redis-backend/fix-persistence.js
require("dotenv").config();
const { createClient } = require("redis");

async function fixRedisPersistence() {
  console.log("Starting Redis persistence fix...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Check for existing data
    const keys = await redisClient.keys("*");
    console.log(`Found ${keys.length} keys in Redis`);

    // Check Redis configuration
    const config = await redisClient.configGet("save");
    console.log("Current Redis save configuration:", config);

    // Set Redis to persist data more frequently
    await redisClient.configSet("save", "60 1");
    console.log(
      "Updated Redis save configuration to: 60 1 (save after 60 seconds if 1 key changed)"
    );

    // Create test data to verify persistence
    const testId = "test-" + Date.now();
    await redisClient.set(`test:${testId}`, "Redis persistence test");
    console.log(`Created test key: test:${testId}`);

    // Manually trigger save
    await redisClient.save();
    console.log("Manually triggered Redis save");

    // Verify test data was saved
    const testExists = await redisClient.exists(`test:${testId}`);
    console.log(`Test key exists: ${testExists}`);

    console.log("Redis persistence fix completed successfully");
  } catch (error) {
    console.error("Error during Redis persistence fix:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the fix function
fixRedisPersistence()
  .then(() => {
    console.log("Redis persistence fix complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fix failed:", err);
    process.exit(1);
  });
