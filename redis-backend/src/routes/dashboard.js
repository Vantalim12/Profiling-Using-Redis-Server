const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { getDashboardStats } = require("../utils/redisUtils");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await getDashboardStats(req.redisClient);
    res.json(stats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get recent registrations
router.get("/recent-registrations", async (req, res) => {
  try {
    // Get all residents sorted by registration date
    const residents = await req.redisClient.keys("resident:*");

    if (!residents.length) {
      return res.json([]);
    }

    const pipeline = req.redisClient.multi();
    residents.forEach((key) => {
      pipeline.hGetAll(key);
    });

    const results = await pipeline.exec();

    // Sort by registration date and get the most recent
    const recentRegistrations = results
      .filter((r) => r.registrationDate)
      .sort(
        (a, b) => new Date(b.registrationDate) - new Date(a.registrationDate)
      )
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        name: `${r.firstName} ${r.lastName}`,
        date: r.registrationDate,
        type: r.type || "Resident",
      }));

    res.json(recentRegistrations);
  } catch (error) {
    console.error("Error getting recent registrations:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get gender distribution
router.get("/gender-distribution", async (req, res) => {
  try {
    // Get all residents
    const residents = await req.redisClient.keys("resident:*");
    const familyHeads = await req.redisClient.keys("familyHead:*");
    const allKeys = [...residents, ...familyHeads];

    if (!allKeys.length) {
      return res.json([]);
    }

    const pipeline = req.redisClient.multi();
    allKeys.forEach((key) => {
      pipeline.hGetAll(key);
    });

    const results = await pipeline.exec();

    // Count by gender
    const genderCounts = results.reduce((acc, person) => {
      const gender = person.gender || "Unknown";
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Format for chart
    const genderData = Object.entries(genderCounts).map(([name, value]) => ({
      name,
      value,
      color:
        name === "Male" ? "#0088FE" : name === "Female" ? "#FF8042" : "#FFBB28",
    }));

    res.json(genderData);
  } catch (error) {
    console.error("Error getting gender distribution:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get age distribution
router.get("/age-distribution", async (req, res) => {
  try {
    // Get all residents and family heads
    const residents = await req.redisClient.keys("resident:*");
    const familyHeads = await req.redisClient.keys("familyHead:*");
    const allKeys = [...residents, ...familyHeads];

    if (!allKeys.length) {
      return res.json([]);
    }

    const pipeline = req.redisClient.multi();
    allKeys.forEach((key) => {
      pipeline.hGetAll(key);
    });

    const results = await pipeline.exec();

    // Initialize age groups
    const ageGroups = {
      "0-10": 0,
      "11-20": 0,
      "21-30": 0,
      "31-40": 0,
      "41-50": 0,
      "51-60": 0,
      "61+": 0,
    };

    // Count by age group
    results.forEach((person) => {
      if (person.birthDate) {
        const birthDate = new Date(person.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        if (age <= 10) ageGroups["0-10"]++;
        else if (age <= 20) ageGroups["11-20"]++;
        else if (age <= 30) ageGroups["21-30"]++;
        else if (age <= 40) ageGroups["31-40"]++;
        else if (age <= 50) ageGroups["41-50"]++;
        else if (age <= 60) ageGroups["51-60"]++;
        else ageGroups["61+"]++;
      }
    });

    // Format for chart
    const ageData = Object.entries(ageGroups).map(([name, count]) => ({
      name,
      count,
    }));

    res.json(ageData);
  } catch (error) {
    console.error("Error getting age distribution:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get monthly registration trends
router.get("/monthly-trends", async (req, res) => {
  try {
    // Get all residents and family heads
    const residents = await req.redisClient.keys("resident:*");
    const familyHeads = await req.redisClient.keys("familyHead:*");
    const allKeys = [...residents, ...familyHeads];

    if (!allKeys.length) {
      return res.json([]);
    }

    const pipeline = req.redisClient.multi();
    allKeys.forEach((key) => {
      pipeline.hGetAll(key);
    });

    const results = await pipeline.exec();

    // Initialize months
    const months = {
      Jan: 0,
      Feb: 0,
      Mar: 0,
      Apr: 0,
      May: 0,
      Jun: 0,
      Jul: 0,
      Aug: 0,
      Sep: 0,
      Oct: 0,
      Nov: 0,
      Dec: 0,
    };

    // Count registrations by month
    results.forEach((person) => {
      if (person.registrationDate) {
        const date = new Date(person.registrationDate);
        const month = date.toLocaleString("default", { month: "short" });

        if (months[month] !== undefined) {
          months[month]++;
        }
      }
    });

    // Format for chart
    const monthlyData = Object.entries(months).map(([name, newResidents]) => ({
      name,
      newResidents,
    }));

    res.json(monthlyData);
  } catch (error) {
    console.error("Error getting monthly trends:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
