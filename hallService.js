
import api from "./api";

// ==========================================
// CREATE HALL
// ==========================================
export const createHall = async (data) => {
  try {
    const response = await api.post("/halls", data);
    return response.data;
  } catch (error) {
    console.error(
      "Create Hall Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET ALL HALLS
// ==========================================
export const getHalls = async () => {
  try {
    const response = await api.get("/halls");
    return response.data;
  } catch (error) {
    console.error(
      "Get Halls Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET HALL BY ID
// ==========================================
export const getHallById = async (id) => {
  try {
    const response = await api.get(`/halls/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get Hall By ID Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// UPDATE HALL
// ==========================================
export const updateHall = async (id, data) => {
  try {
    const response = await api.put(`/halls/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Update Hall Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// DELETE HALL
// ==========================================
export const deleteHall = async (id) => {
  try {
    const response = await api.delete(`/halls/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete Hall Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// DEFAULT EXPORT
// ==========================================
const hallService = {
  createHall,
  getHalls,
  getHallById,
  updateHall,
  deleteHall,
};

export default hallService;
