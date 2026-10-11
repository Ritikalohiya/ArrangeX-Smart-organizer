
import api from "./api";

// ==========================================
// DASHBOARD STATS
// ==========================================
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error(
      "Dashboard Stats Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// RECENT ACTIVITIES
// ==========================================
export const getRecentActivities = async () => {
  try {
    const response = await api.get(
      "/dashboard/recent-activities"
    );
    return response.data;
  } catch (error) {
    console.error(
      "Recent Activities Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// SEATING CHART
// ==========================================
export const getSeatingChart = async () => {
  try {
    const response = await api.get(
      "/dashboard/seating-chart"
    );
    return response.data;
  } catch (error) {
    console.error(
      "Seating Chart Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// DEFAULT EXPORT
// ==========================================
const dashboardService = {
  getDashboardStats,
  getRecentActivities,
  getSeatingChart,
};

export default dashboardService;
