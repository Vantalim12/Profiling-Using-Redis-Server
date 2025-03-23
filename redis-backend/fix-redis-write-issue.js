// Save as redis-backend/fix-redis-write-issue.js
require("dotenv").config();
const { createClient } = require("redis");

async function fixRedisWriteIssue() {
  console.log("Starting Redis write issue fix...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Disable Redis persistence temporarily to allow writes
    console.log("Disabling Redis persistence...");
    await redisClient.configSet("stop-writes-on-bgsave-error", "no");
    console.log("Successfully disabled stop-writes-on-bgsave-error");

    // Check Redis info for more details
    const info = await redisClient.info();
    console.log("\nRedis server info (persistence section):");

    // Extract persistence info
    const persistenceInfo = info
      .split("\n")
      .filter(
        (line) =>
          line.includes("rdb_") ||
          line.includes("aof_") ||
          line.includes("persistence")
      );

    persistenceInfo.forEach((line) => console.log(line));

    // Print dir setting
    const dir = await redisClient.configGet("dir");
    console.log("\nRedis data directory:", dir);

    // Print dbfilename setting
    const dbfilename = await redisClient.configGet("dbfilename");
    console.log("Redis RDB filename:", dbfilename);

    console.log("\nRedis should now accept write commands.");
    console.log("However, your data may not be persisting between restarts.");
    console.log(
      "Check the Redis logs for more information about the disk error."
    );
  } catch (error) {
    console.error("Error fixing Redis write issue:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the fix function
fixRedisWriteIssue()
  .then(() => {
    console.log("Redis write issue fix complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fix failed:", err);
    process.exit(1);
  });
