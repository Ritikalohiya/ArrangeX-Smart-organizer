
import api from "./api";

// CREATE BUILDING
export const createBuilding = async (buildingData) => {
  try {
    const response = await api.post(
      "/buildings",
      buildingData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Create Building Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// GET ALL BUILDINGS
export const getBuildings = async () => {
  try {
    const response = await api.get("/buildings");
    return response.data;
  } catch (error) {
    console.error(
      "Get Buildings Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// GET BUILDING BY ID
export const getBuildingById = async (id) => {
  try {
    const response = await api.get(`/buildings/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get Building By ID Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// UPDATE BUILDING
export const updateBuilding = async (id, buildingData) => {
  try {
    const response = await api.put(
      `/buildings/${id}`,
      buildingData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Update Building Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// DELETE BUILDING
export const deleteBuilding = async (id) => {
  try {
    const response = await api.delete(`/buildings/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete Building Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// DEFAULT EXPORT
const buildingService = {
  createBuilding,
  getBuildings,
  getBuildingById,
  updateBuilding,
  deleteBuilding,
};

export default buildingService;
