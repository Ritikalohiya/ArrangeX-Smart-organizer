
import api from "./api";

// ==========================================
// GENERATE SEATING
// ==========================================
export const generateSeating = async (data) => {
  try {
    const response = await api.post("/seating/generate", data);
    return response.data;
  } catch (error) {
    console.error(
      "Generate Seating Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET ALL SEATING
// ==========================================
export const getSeating = async () => {
  try {
    const response = await api.get("/seating");
    return response.data;
  } catch (error) {
    console.error(
      "Get Seating Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET SEATING BY EXAM
// ==========================================
export const getSeatingByExam = async (examId) => {
  try {
    const response = await api.get(`/seating/exam/${examId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get Seating By Exam Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET SEATING BY HALL
// ==========================================
export const getSeatingByHall = async (hallId) => {
  try {
    const response = await api.get(`/seating/hall/${hallId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get Seating By Hall Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// UPDATE SEAT
// ==========================================
export const updateSeat = async (id, data) => {
  try {
    const response = await api.put(`/seating/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Update Seat Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// DELETE SEATING
// ==========================================
export const deleteSeating = async (id) => {
  try {
    const response = await api.delete(`/seating/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete Seating Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// DEFAULT EXPORT
// ==========================================
const seatingService = {
  generateSeating,
  getSeating,
  getSeatingByExam,
  getSeatingByHall,
  updateSeat,
  deleteSeating,
};

export default seatingService;
