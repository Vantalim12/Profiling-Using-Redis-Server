// Save as redis-backend/create-resident-user.js
require("dotenv").config();
const { createClient } = require("redis");
const bcrypt = require("bcryptjs");

async function createResidentUser() {
  console.log("Starting resident user creation...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Get the first resident to use as test account
    const residentKeys = await redisClient.keys("resident:*");

    if (residentKeys.length === 0) {
      console.log("No residents found. Please create a resident first.");
      return;
    }

    const residentKey = residentKeys[0];
    const resident = await redisClient.hGetAll(residentKey);
    console.log(
      `Using resident: ${resident.firstName} ${resident.lastName} (${residentKey})`
    );

    // Check if user already exists
    const username = "resident1";
    const userExists = await redisClient.exists(`user:${username}`);

    if (userExists) {
      console.log(`User ${username} already exists. Will update it.`);
      await redisClient.del(`user:${username}`);
    }

    // Create the user with hashed password
    const password = "resident123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with Redis 3.0 compatible hSet (one field at a time)
    const userKey = `user:${username}`;
    await redisClient.hSet(userKey, "username", username);
    await redisClient.hSet(userKey, "password", hashedPassword);
    await redisClient.hSet(
      userKey,
      "name",
      `${resident.firstName} ${resident.lastName}`
    );
    await redisClient.hSet(userKey, "role", "resident");
    await redisClient.hSet(userKey, "residentId", resident.id);

    console.log(`Created resident user account:`);
    console.log(`- Username: ${username}`);
    console.log(`- Password: ${password}`);
    console.log(`- Name: ${resident.firstName} ${resident.lastName}`);
    console.log(`- Role: resident`);
    console.log(`- Resident ID: ${resident.id}`);

    // Verify user was created
    const user = await redisClient.hGetAll(userKey);
    console.log("User created with fields:", Object.keys(user));
  } catch (error) {
    console.error("Error creating resident user:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the script
createResidentUser()
  .then(() => {
    console.log("Resident user creation complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Script failed:", err);
    process.exit(1);
  });
