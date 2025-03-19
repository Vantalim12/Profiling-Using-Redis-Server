require("dotenv").config();
const { createClient } = require("redis");
const bcrypt = require("bcryptjs");

async function fixAdminUser() {
  console.log("Starting admin user fix...");

  // Create Redis client
  const redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // Connect to Redis
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("Connected to Redis");

  try {
    // Check if admin exists
    const adminExists = await redisClient.exists("user:admin");
    console.log(`Admin user exists: ${adminExists}`);

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    console.log("Generated new password hash");

    if (adminExists) {
      // Update the admin user with password
      await redisClient.hSet("user:admin", "password", hashedPassword);
      console.log("Updated admin user with password field");
    } else {
      // Create a new admin user
      await redisClient.hSet(
        "user:admin",
        "username",
        "admin",
        "password",
        hashedPassword,
        "role",
        "admin",
        "name",
        "Juan Dela Cruz"
      );
      console.log("Created new admin user");
    }

    // Verify the user now
    const user = await redisClient.hGetAll("user:admin");
    console.log("Updated admin user fields:", Object.keys(user));
    console.log("Password field exists:", !!user.password);
  } catch (error) {
    console.error("Error fixing admin user:", error);
  } finally {
    // Close Redis connection
    await redisClient.quit();
    console.log("Redis connection closed");
  }
}

// Run the fix function
fixAdminUser()
  .then(() => {
    console.log("Admin user fix complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fix failed:", err);
    process.exit(1);
  });
