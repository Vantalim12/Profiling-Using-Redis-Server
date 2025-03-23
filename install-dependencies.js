// save as install-dependencies.js in the root folder

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Installing required dependencies...");

// Backend dependencies
console.log("\nChecking backend dependencies...");
const backendDir = path.join(__dirname, "redis-backend");
if (fs.existsSync(backendDir)) {
  process.chdir(backendDir);
  console.log("Installing uuid package...");
  execSync("npm install uuid --save", { stdio: "inherit" });
  console.log("Backend dependencies installed successfully.");
} else {
  console.log("Backend directory not found. Skipping backend dependencies.");
}

// Frontend dependencies
console.log("\nChecking frontend dependencies...");
const frontendDir = path.join(__dirname, "redis-frontend");
if (fs.existsSync(frontendDir)) {
  process.chdir(frontendDir);
  console.log("Installing frontend dependencies...");
  execSync("npm install --save", { stdio: "inherit" });
  console.log("Frontend dependencies installed successfully.");
} else {
  console.log("Frontend directory not found. Skipping frontend dependencies.");
}

console.log("\nAll dependencies installed successfully.");
console.log(
  "You can now start the backend with: cd redis-backend && npm run dev"
);
console.log("And the frontend with: cd redis-frontend && npm start");
