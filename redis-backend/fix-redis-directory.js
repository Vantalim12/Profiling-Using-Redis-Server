// Create this as redis-backend/fix-redis-directory.js
require("dotenv").config();
const { createClient } = require("redis");
const fs = require("fs");
const path = require("path");

async function fixRedisDirectory() {
  console.log("Starting Redis directory fix...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Create data directory in a writable location
    const dataDir = path.join(__dirname, "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
      console.log(`Created data directory: ${dataDir}`);
    }

    // Set Redis to use this directory
    console.log(`Setting Redis data directory to: ${dataDir}`);
    await redisClient.configSet("dir", dataDir);

    // Verify the change
    const newDir = await redisClient.configGet("dir");
    console.log("New Redis data directory:", newDir);

    // Save the current configuration
    console.log("Saving Redis configuration...");
    const result = await redisClient.configRewrite();
    console.log("Configuration rewrite result:", result);

    // Save the current data
    console.log("Saving current data...");
    await redisClient.save();
    console.log("Data saved successfully");

    console.log("\nRedis data directory has been changed.");
    console.log("Your data should now persist between restarts.");
  } catch (error) {
    console.error("Error fixing Redis directory:", error);
    console.log(
      "\nAlternative action: If the above failed, try running your Redis server as Administrator"
    );
    console.log(
      "or manually edit your redis.windows.conf file to set 'dir' to a writable location."
    );
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the fix function
fixRedisDirectory()
  .then(() => {
    console.log("Redis directory fix complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fix failed:", err);
    process.exit(1);
  });
