// Save this as redis-backend/fix-data.js

require("dotenv").config();
const { createClient } = require("redis");

async function fixData() {
  console.log("Starting data fix...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Fix family heads
    const familyHeadKeys = await redisClient.keys("familyHead:*");
    console.log(`Found ${familyHeadKeys.length} family heads to fix`);

    for (const key of familyHeadKeys) {
      const data = await redisClient.hGetAll(key);
      console.log(`Fixing family head ${key}:`, data);

      if (Object.keys(data).length) {
        const id = data.id || key.split(":")[1];
        const registrationDate =
          data.registrationDate || new Date().toISOString();

        // Re-save with the correct format
        await redisClient.hSet(
          key,
          "id",
          id,
          "firstName",
          data.firstName || "",
          "lastName",
          data.lastName || "",
          "gender",
          data.gender || "",
          "birthDate",
          data.birthDate || "",
          "address",
          data.address || "",
          "contactNumber",
          data.contactNumber || "",
          "registrationDate",
          registrationDate,
          "type",
          "Family Head"
        );
        console.log(`Fixed family head ${key}`);
      }
    }

    // Fix residents
    const residentKeys = await redisClient.keys("resident:*");
    console.log(`Found ${residentKeys.length} residents to fix`);

    for (const key of residentKeys) {
      const data = await redisClient.hGetAll(key);
      console.log(`Fixing resident ${key}:`, data);

      if (Object.keys(data).length) {
        const id = data.id || key.split(":")[1];
        const registrationDate =
          data.registrationDate || new Date().toISOString();

        // Re-save with the correct format
        await redisClient.hSet(
          key,
          "id",
          id,
          "firstName",
          data.firstName || "",
          "lastName",
          data.lastName || "",
          "gender",
          data.gender || "",
          "birthDate",
          data.birthDate || "",
          "address",
          data.address || "",
          "contactNumber",
          data.contactNumber || "",
          "familyHeadId",
          data.familyHeadId || "",
          "registrationDate",
          registrationDate,
          "type",
          "Resident"
        );
        console.log(`Fixed resident ${key}`);
      }
    }

    console.log("Data fix completed successfully");
  } catch (error) {
    console.error("Error fixing data:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the fix function
fixData()
  .then(() => {
    console.log("Data fix complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fix failed:", err);
    process.exit(1);
  });
