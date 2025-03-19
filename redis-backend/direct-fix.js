// Save as redis-backend/direct-fix.js
require("dotenv").config();
const { createClient } = require("redis");

async function directFix() {
  console.log("Starting direct Redis data fix...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // 1. Completely rebuild family head records
    const familyHeadKeys = await redisClient.keys("familyHead:*");
    console.log(`Found ${familyHeadKeys.length} family head keys to repair`);

    for (const key of familyHeadKeys) {
      const id = key.split(":")[1];
      console.log(`Rebuilding family head record for ${id}`);

      // Delete existing record
      await redisClient.del(key);

      // Create a completely new record with all required fields
      const now = new Date();
      const registrationDate = now.toISOString();

      // Use hSet with individual args (not array)
      await redisClient.hSet(
        key,
        "id",
        id,
        "firstName",
        `FamilyHead${id.split("-")[1]}`,
        "lastName",
        "Test",
        "gender",
        "Male",
        "birthDate",
        "2000-01-01",
        "address",
        `Test Address ${id}`,
        "contactNumber",
        "123456789",
        "registrationDate",
        registrationDate,
        "type",
        "Family Head"
      );

      // Verify the fix worked
      const updatedData = await redisClient.hGetAll(key);
      console.log(`Updated family head data for ${id}:`, updatedData);
      console.log(`Fields: ${Object.keys(updatedData).length}`);
      console.log(`Fields: ${Object.keys(updatedData)}`);
    }

    // 2. Fix resident records
    const residentKeys = await redisClient.keys("resident:*");
    console.log(`Found ${residentKeys.length} resident keys to repair`);

    for (const key of residentKeys) {
      const id = key.split(":")[1];
      console.log(`Rebuilding resident record for ${id}`);

      // Delete existing record
      await redisClient.del(key);

      // Create a completely new record with all required fields
      const now = new Date();
      const registrationDate = now.toISOString();

      // Use hSet with individual args (not array)
      await redisClient.hSet(
        key,
        "id",
        id,
        "firstName",
        `Resident${id.split("-")[1]}`,
        "lastName",
        "Test",
        "gender",
        "Female",
        "birthDate",
        "2005-01-01",
        "address",
        `Test Address ${id}`,
        "contactNumber",
        "987654321",
        "familyHeadId",
        "",
        "registrationDate",
        registrationDate,
        "type",
        "Resident"
      );

      // Verify the fix worked
      const updatedData = await redisClient.hGetAll(key);
      console.log(`Updated resident data for ${id}:`, updatedData);
      console.log(`Fields: ${Object.keys(updatedData).length}`);
      console.log(`Fields: ${Object.keys(updatedData)}`);
    }

    console.log("Direct fix completed successfully");
  } catch (error) {
    console.error("Error during direct fix:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the fix function
directFix()
  .then(() => {
    console.log("Direct fix complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fix failed:", err);
    process.exit(1);
  });
