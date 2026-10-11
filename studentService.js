
import api from "./api";

// ==========================================
// CREATE STUDENT
// ==========================================
export const createStudent = async (data) => {
  try {
    const response = await api.post("/students", data);
    return response.data;
  } catch (error) {
    console.error(
      "Create Student Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET ALL STUDENTS
// ==========================================
export const getStudents = async () => {
  try {
    const response = await api.get("/students");
    return response.data;
  } catch (error) {
    console.error(
      "Get Students Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET STUDENT BY ID
// ==========================================
export const getStudentById = async (id) => {
  try {
    const response = await api.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get Student By ID Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// UPDATE STUDENT
// ==========================================
export const updateStudent = async (id, data) => {
  try {
    const response = await api.put(`/students/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Update Student Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// DELETE STUDENT
// ==========================================
export const deleteStudent = async (id) => {
  try {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete Student Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// DEFAULT EXPORT
// ==========================================
const studentService = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};

export default studentService;
