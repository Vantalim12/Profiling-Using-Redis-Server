// Save as redis-backend/redis3-fix.js
require("dotenv").config();
const { createClient } = require("redis");

async function redis3Fix() {
  console.log("Starting Redis 3.0 compatible fix...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // For Redis 3.0, we need to use hSet one field at a time

    // Fix family heads
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

      // For Redis 3.0, we must set one field at a time
      await redisClient.hSet(key, "id", id);
      await redisClient.hSet(key, "firstName", `FamilyHead${id.split("-")[1]}`);
      await redisClient.hSet(key, "lastName", "Test");
      await redisClient.hSet(key, "gender", "Male");
      await redisClient.hSet(key, "birthDate", "2000-01-01");
      await redisClient.hSet(key, "address", `Test Address ${id}`);
      await redisClient.hSet(key, "contactNumber", "123456789");
      await redisClient.hSet(key, "registrationDate", registrationDate);
      await redisClient.hSet(key, "type", "Family Head");

      // Verify the fix worked
      const updatedData = await redisClient.hGetAll(key);
      console.log(`Updated family head data for ${id}:`, updatedData);
      console.log(`Fields: ${Object.keys(updatedData).length}`);
      console.log(`Fields: ${Object.keys(updatedData)}`);
    }

    // Fix residents
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

      // For Redis 3.0, we must set one field at a time
      await redisClient.hSet(key, "id", id);
      await redisClient.hSet(key, "firstName", `Resident${id.split("-")[1]}`);
      await redisClient.hSet(key, "lastName", "Test");
      await redisClient.hSet(key, "gender", "Female");
      await redisClient.hSet(key, "birthDate", "2005-01-01");
      await redisClient.hSet(key, "address", `Test Address ${id}`);
      await redisClient.hSet(key, "contactNumber", "987654321");
      await redisClient.hSet(key, "familyHeadId", "");
      await redisClient.hSet(key, "registrationDate", registrationDate);
      await redisClient.hSet(key, "type", "Resident");

      // Verify the fix worked
      const updatedData = await redisClient.hGetAll(key);
      console.log(`Updated resident data for ${id}:`, updatedData);
      console.log(`Fields: ${Object.keys(updatedData).length}`);
      console.log(`Fields: ${Object.keys(updatedData)}`);
    }

    console.log("Redis 3.0 compatible fix completed successfully");
  } catch (error) {
    console.error("Error during fix:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the fix function
redis3Fix()
  .then(() => {
    console.log("Redis 3.0 fix complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fix failed:", err);
    process.exit(1);
  });
