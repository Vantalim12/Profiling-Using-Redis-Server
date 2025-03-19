// Save as redis-backend/debug-redis.js
require("dotenv").config();
const { createClient } = require("redis");

async function debugRedis() {
  console.log("Starting Redis debugging...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // 1. Check all keys in the database
    const allKeys = await redisClient.keys("*");
    console.log("All keys in Redis:", allKeys);

    // 2. Check specific family head data
    const familyHeadKeys = await redisClient.keys("familyHead:*");
    console.log(`Found ${familyHeadKeys.length} family head keys`);

    for (const key of familyHeadKeys) {
      console.log(`\nInspecting family head: ${key}`);

      // Get all data for this family head
      const data = await redisClient.hGetAll(key);
      console.log("Raw data:", data);

      // Check the type
      console.log("Data type:", typeof data);

      // Check if data is properly structured with expected keys
      const expectedKeys = [
        "id",
        "firstName",
        "lastName",
        "gender",
        "birthDate",
        "address",
        "contactNumber",
        "registrationDate",
        "type",
      ];

      console.log("Available keys:", Object.keys(data));

      // Check what expected keys are missing
      const missingKeys = expectedKeys.filter(
        (k) => !Object.keys(data).includes(k)
      );
      if (missingKeys.length > 0) {
        console.log("Missing keys:", missingKeys);
      }

      // Try accessing key values directly
      console.log("Direct access tests:");
      console.log("- firstName:", data.firstName);
      console.log("- lastName:", data.lastName);
      console.log("- gender:", data.gender);

      // Try to fix this record
      if (!data.firstName || !data.lastName) {
        console.log("Attempting to fix broken record");

        // Generate a test name
        const testFirstName = "Test";
        const testLastName = "User";

        try {
          // Clear hash and set new values with correct format
          await redisClient.del(key);

          await redisClient.hSet(
            key,
            "id",
            key.split(":")[1],
            "firstName",
            testFirstName,
            "lastName",
            testLastName,
            "gender",
            data.gender || "Male",
            "birthDate",
            data.birthDate || "2000-01-01",
            "address",
            data.address || "Test Address",
            "contactNumber",
            data.contactNumber || "123456789",
            "registrationDate",
            data.registrationDate || new Date().toISOString(),
            "type",
            "Family Head"
          );

          console.log("Record fixed and updated with test data");

          // Verify fix
          const updatedData = await redisClient.hGetAll(key);
          console.log("Updated data:", updatedData);
        } catch (fixError) {
          console.error("Error fixing record:", fixError);
        }
      }
    }

    // 3. Check the getAllItems function implementation manually
    console.log("\nTesting getAllItems functionality manually:");
    const keyPattern = "familyHead:*";
    const keys = await redisClient.keys(keyPattern);
    console.log(`Found ${keys.length} keys matching ${keyPattern}`);

    const results = [];
    for (const key of keys) {
      const item = await redisClient.hGetAll(key);
      console.log(`Retrieved item from ${key}:`, item);
      console.log("Item keys:", Object.keys(item));
      if (Object.keys(item).length > 0) {
        results.push(item);
      }
    }

    console.log(`Final results: ${results.length} items`);
    console.log(results);
  } catch (error) {
    console.error("Error during debugging:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the debug function
debugRedis()
  .then(() => {
    console.log("Debug process complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Debug failed:", err);
    process.exit(1);
  });
