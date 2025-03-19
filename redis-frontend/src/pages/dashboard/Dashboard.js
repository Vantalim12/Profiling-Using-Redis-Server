// src/pages/dashboard/Dashboard.js - Updated to handle different user roles
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard"; // Rename your current Dashboard component to AdminDashboard
import ResidentDashboard from "./ResidentDashboard"; // New component for residents

const Dashboard = () => {
  const { currentUser } = useAuth();

  // Show different dashboard based on user role
  if (currentUser?.role === "admin") {
    return <AdminDashboard />;
  } else if (currentUser?.role === "resident") {
    return <ResidentDashboard />;
  }

  // Fallback for unknown roles
  return (
    <div className="text-center py-5">
      <h3>Welcome to the Barangay Management System</h3>
      <p>Your dashboard is loading...</p>
    </div>
  );
};

export default Dashboard;
