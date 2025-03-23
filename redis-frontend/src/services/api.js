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

// Announcement service
export const announcementService = {
  getAll: () => axios.get(`${API_URL}/api/announcements`),
  getById: (id) => axios.get(`${API_URL}/api/announcements/${id}`),
  create: (data) => axios.post(`${API_URL}/api/announcements`, data),
  update: (id, data) => axios.put(`${API_URL}/api/announcements/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/api/announcements/${id}`),
};

// Events service
export const eventService = {
  getAll: () => axios.get(`${API_URL}/api/events`),
  getById: (id) => axios.get(`${API_URL}/api/events/${id}`),
  create: (data) => axios.post(`${API_URL}/api/events`, data),
  update: (id, data) => axios.put(`${API_URL}/api/events/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/api/events/${id}`),
};

// Document Request service
export const documentRequestService = {
  getAll: () => axios.get(`${API_URL}/api/documents`),
  getById: (id) => axios.get(`${API_URL}/api/documents/${id}`),
  getByResident: (residentId) =>
    axios.get(`${API_URL}/api/documents/resident/${residentId}`),
  create: (data) => axios.post(`${API_URL}/api/documents`, data),
  updateStatus: (id, data) =>
    axios.put(`${API_URL}/api/documents/${id}/status`, data),
  delete: (id) => axios.delete(`${API_URL}/api/documents/${id}`),
};
