// src/services/api.js
import axios from "axios";

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || "";

// Dashboard service
export const dashboardService = {
  getStats: () => axios.get(`${API_URL}/api/dashboard/stats`),
  getRecentRegistrations: () =>
    axios.get(`${API_URL}/api/dashboard/recent-registrations`),
  getGenderDistribution: () =>
    axios.get(`${API_URL}/api/dashboard/gender-distribution`),
  getAgeDistribution: () =>
    axios.get(`${API_URL}/api/dashboard/age-distribution`),
  getMonthlyTrends: () => axios.get(`${API_URL}/api/dashboard/monthly-trends`),
};

// Resident service
export const residentService = {
  getAll: () => axios.get(`${API_URL}/api/residents`),
  getById: (id) => axios.get(`${API_URL}/api/residents/${id}`),
  create: (data) => axios.post(`${API_URL}/api/residents`, data),
  update: (id, data) => axios.put(`${API_URL}/api/residents/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/api/residents/${id}`),
};

// Family Head service
export const familyHeadService = {
  getAll: () => axios.get(`${API_URL}/api/familyHeads`),
  getById: (id) => axios.get(`${API_URL}/api/familyHeads/${id}`),
  getMembers: (id) => axios.get(`${API_URL}/api/familyHeads/${id}/members`),
  create: (data) => axios.post(`${API_URL}/api/familyHeads`, data),
  update: (id, data) => axios.put(`${API_URL}/api/familyHeads/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/api/familyHeads/${id}`),
};
