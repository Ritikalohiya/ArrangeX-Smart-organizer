
import api from "./api";

// ==============================
// ADD COLLEGE
// ==============================
export const createCollege = async (data) => {
  try {
    const response = await api.post("/colleges", data);
    return response.data;
  } catch (error) {
    console.error(
      "Create College Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==============================
// SHOW ALL COLLEGES
// ==============================
export const getColleges = async () => {
  try {
    const response = await api.get("/colleges");
    return response.data;
  } catch (error) {
    console.error(
      "Get Colleges Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==============================
// GET SINGLE COLLEGE
// ==============================
export const getCollegeById = async (id) => {
  try {
    const response = await api.get(`/colleges/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get College By ID Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==============================
// UPDATE COLLEGE
// ==============================
export const updateCollege = async (id, data) => {
  try {
    const response = await api.put(`/colleges/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Update College Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==============================
// DELETE COLLEGE
// ==============================
export const deleteCollege = async (id) => {
  try {
    const response = await api.delete(`/colleges/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete College Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==============================
// DEFAULT EXPORT
// ==============================
const collegeService = {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege,
};

export default collegeService;
