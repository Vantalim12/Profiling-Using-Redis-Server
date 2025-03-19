// src/contexts/AuthContext.js - Updated for role-based permissions
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Set auth header for all requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Get current user info
      const fetchUser = async () => {
        try {
          const response = await axios.get("/api/auth/me");
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error fetching user:", error);
          // Clear invalid token
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await axios.post("/api/auth/login", {
        username,
        password,
      });

      // Store token in localStorage
      localStorage.setItem("token", response.data.token);

      // Set auth header
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      // Set user data
      setCurrentUser(response.data.user);
      setIsAuthenticated(true);

      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error.response?.data?.error || "Login failed. Please try again.";
      toast.error(errorMsg);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Remove auth header
    delete axios.defaults.headers.common["Authorization"];

    // Clear user data
    setCurrentUser(null);
    setIsAuthenticated(false);

    toast.info("Logged out successfully");
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      console.error("Change password error:", error);
      const errorMsg =
        error.response?.data?.error ||
        "Failed to change password. Please try again.";
      toast.error(errorMsg);
      return false;
    }
  };

  // Helper to check if current user can access a specific resident
  const canAccessResident = (residentId) => {
    // Admin can access all residents
    if (currentUser?.role === "admin") return true;

    // Resident can only access their own data
    if (currentUser?.role === "resident") {
      return currentUser.residentId === residentId;
    }

    return false;
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    login,
    logout,
    changePassword,
    canAccessResident,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
