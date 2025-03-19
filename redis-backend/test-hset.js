// Save as redis-backend/test-hset.js
require("dotenv").config();
const { createClient } = require("redis");

async function testHSet() {
  console.log("Testing Redis hSet behavior...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Create a test key
    const testKey = "test:hset";

    // First remove any existing test key
    await redisClient.del(testKey);
    console.log("Removed existing test key");

    // Test 1: Using multiple individual arguments (correct)
    console.log("\nTest 1: Using individual arguments");
    await redisClient.hSet(
      testKey,
      "field1",
      "value1",
      "field2",
      "value2",
      "field3",
      "value3"
    );

    // Verify Test 1
    const resultTest1 = await redisClient.hGetAll(testKey);
    console.log("Result Test 1:", resultTest1);
    console.log("Keys:", Object.keys(resultTest1));

    // Clear the key
    await redisClient.del(testKey);

    // Test 2: Using array format (incorrect)
    console.log("\nTest 2: Using array format (this is wrong)");
    const fieldsArray = [
      "field1",
      "value1",
      "field2",
      "value2",
      "field3",
      "value3",
    ];

    try {
      await redisClient.hSet(testKey, fieldsArray);
      const resultTest2 = await redisClient.hGetAll(testKey);
      console.log("Result Test 2:", resultTest2);
      console.log("Keys:", Object.keys(resultTest2));
    } catch (error) {
      console.error("Error with array format:", error);
    }

    // Clear the key
    await redisClient.del(testKey);

    // Test 3: Object format
    console.log("\nTest 3: Using object format");
    const fieldsObject = {
      field1: "value1",
      field2: "value2",
      field3: "value3",
    };

    try {
      await redisClient.hSet(testKey, fieldsObject);
      const resultTest3 = await redisClient.hGetAll(testKey);
      console.log("Result Test 3:", resultTest3);
      console.log("Keys:", Object.keys(resultTest3));
    } catch (error) {
      console.error("Error with object format:", error);
    }

    // Test 4: Redis version info
    console.log("\nTest 4: Redis version info");
    const info = await redisClient.info();
    console.log(
      "Redis version info:",
      info.split("\n").filter((line) => line.includes("redis_version"))
    );

    // Test 5: Check node_redis client version
    console.log("\nTest 5: node_redis module version");
    console.log(
      "node_redis client version:",
      redisClient.isReady ? "Connected" : "Not connected"
    );
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the test function
testHSet()
  .then(() => {
    console.log("hSet tests complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Tests failed:", err);
    process.exit(1);
  });
