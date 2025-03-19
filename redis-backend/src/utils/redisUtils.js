/**
 * Redis utilities for handling data storage and retrieval
 */

// Generate a unique ID with a prefix and count
async function generateId(redisClient, countKey, prefix) {
  const count = await redisClient.incr(countKey);
  return `${prefix}-${new Date().getFullYear()}${count
    .toString()
    .padStart(3, "0")}`;
}

// Get all items of a certain type - FIXED VERSION
async function getAllItems(redisClient, pattern) {
  const keys = await redisClient.keys(pattern);
  console.log(`getAllItems: Found ${keys.length} keys matching ${pattern}`);

  if (!keys.length) return [];

  const results = [];

  // Process each key individually to ensure we get proper data
  for (const key of keys) {
    try {
      const item = await redisClient.hGetAll(key);
      console.log(
        `getAllItems: Item from ${key} has ${Object.keys(item).length} keys:`,
        Object.keys(item)
      );

      // Only include items that have actual data
      if (Object.keys(item).length > 0) {
        // Make sure to handle undefined values
        const processedItem = {
          id: item.id || key.split(":")[1],
          firstName: item.firstName || "",
          lastName: item.lastName || "",
          gender: item.gender || "",
          birthDate: item.birthDate || "",
          address: item.address || "",
          contactNumber: item.contactNumber || "",
          registrationDate: item.registrationDate || "",
          type:
            item.type ||
            (pattern.includes("familyHead") ? "Family Head" : "Resident"),
        };

        // If it's a resident, also include family head ID
        if (pattern.includes("resident")) {
          processedItem.familyHeadId = item.familyHeadId || "";
        }

        results.push(processedItem);
      }
    } catch (error) {
      console.error(`Error processing item ${key}:`, error);
    }
  }

  console.log(`getAllItems: Returning ${results.length} processed items`);
  return results;
}

// Get an item by ID - FIXED VERSION
async function getItemById(redisClient, key) {
  console.log(`getItemById: Looking for key ${key}`);
  const exists = await redisClient.exists(key);
  if (!exists) {
    console.log(`getItemById: Key ${key} not found`);
    return null;
  }

  try {
    const item = await redisClient.hGetAll(key);
    console.log(
      `getItemById: Found item with ${Object.keys(item).length} keys:`,
      Object.keys(item)
    );

    // Process the item to ensure all fields are present
    if (Object.keys(item).length > 0) {
      const isResident = key.includes("resident");
      const processedItem = {
        id: item.id || key.split(":")[1],
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        gender: item.gender || "",
        birthDate: item.birthDate || "",
        address: item.address || "",
        contactNumber: item.contactNumber || "",
        registrationDate: item.registrationDate || "",
        type: item.type || (isResident ? "Resident" : "Family Head"),
      };

      // If it's a resident, also include family head ID
      if (isResident) {
        processedItem.familyHeadId = item.familyHeadId || "";
      }

      return processedItem;
    }
    return null;
  } catch (error) {
    console.error(`Error retrieving item ${key}:`, error);
    return null;
  }
}

// Create statistics for dashboard
async function getDashboardStats(redisClient) {
  // Get counts
  const [totalResidents, totalFamilyHeads] = await Promise.all([
    redisClient.get("residents:count"),
    redisClient.get("familyHeads:count"),
  ]);

  // Get all residents and family heads for analysis
  const [residents, familyHeads] = await Promise.all([
    getAllItems(redisClient, "resident:*"),
    getAllItems(redisClient, "familyHead:*"),
  ]);

  // Combine both for demographic analysis
  const allPeople = [...residents, ...familyHeads];

  // Gender distribution
  const genderData = allPeople.reduce((acc, person) => {
    const gender = person.gender || "Unknown";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  // Age distribution
  const ageData = allPeople.reduce((acc, person) => {
    if (!person.birthDate) return acc;

    try {
      const birthDate = new Date(person.birthDate);
      if (isNaN(birthDate.getTime())) return acc; // Skip invalid dates

      const age = new Date().getFullYear() - birthDate.getFullYear();

      let ageGroup = "61+";
      if (age <= 10) ageGroup = "0-10";
      else if (age <= 20) ageGroup = "11-20";
      else if (age <= 30) ageGroup = "21-30";
      else if (age <= 40) ageGroup = "31-40";
      else if (age <= 50) ageGroup = "41-50";
      else if (age <= 60) ageGroup = "51-60";

      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    } catch (error) {
      console.error("Error processing age for person:", person, error);
    }
    return acc;
  }, {});

  // Monthly registrations
  const monthlyRegistrations = allPeople.reduce((acc, person) => {
    if (person.registrationDate) {
      try {
        const date = new Date(person.registrationDate);
        if (isNaN(date.getTime())) return acc; // Skip invalid dates

        const month = date.toLocaleString("default", { month: "short" });
        acc[month] = (acc[month] || 0) + 1;
      } catch (error) {
        console.error(
          "Error processing registration date for person:",
          person,
          error
        );
      }
    }
    return acc;
  }, {});

  // Recent registrations
  const recentRegistrations = allPeople
    .filter(
      (p) =>
        p.registrationDate && !isNaN(new Date(p.registrationDate).getTime())
    )
    .sort((a, b) => {
      try {
        return new Date(b.registrationDate) - new Date(a.registrationDate);
      } catch (error) {
        return 0; // In case of error, don't change order
      }
    })
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`.trim() || "Unnamed",
      date: p.registrationDate,
      type: p.type || (p.id.startsWith("F-") ? "Family Head" : "Resident"),
    }));

  return {
    totalResidents: parseInt(totalResidents) || 0,
    totalFamilyHeads: parseInt(totalFamilyHeads) || 0,
    genderData: Object.entries(genderData).map(([name, value]) => ({
      name,
      value,
      color:
        name === "Male" ? "#0088FE" : name === "Female" ? "#FF8042" : "#FFBB28",
    })),
    ageData: Object.entries(ageData).map(([name, count]) => ({ name, count })),
    monthlyRegistrations: Object.entries(monthlyRegistrations).map(
      ([name, newResidents]) => ({
        name,
        newResidents,
      })
    ),
    recentRegistrations,
  };
}

module.exports = {
  generateId,
  getAllItems,
  getItemById,
  getDashboardStats,
};
