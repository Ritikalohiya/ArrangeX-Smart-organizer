
import api from "./api";

// ==========================================
// CREATE EXAM
// ==========================================
const createExam = async (data) => {
  try {
    const response = await api.post("/exams", data);
    return response.data;
  } catch (error) {
    console.error(
      "Create Exam Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET ALL EXAMS
// ==========================================
const getExams = async () => {
  try {
    const response = await api.get("/exams");
    return response.data;
  } catch (error) {
    console.error(
      "Get Exams Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// GET EXAM BY ID
// ==========================================
const getExamById = async (id) => {
  try {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Get Exam By ID Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// UPDATE EXAM
// ==========================================
const updateExam = async (id, data) => {
  try {
    const response = await api.put(`/exams/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(
      "Update Exam Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// DELETE EXAM
// ==========================================
const deleteExam = async (id) => {
  try {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete Exam Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// ==========================================
// EXPORT SERVICE
// ==========================================
const examService = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
};

export {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
};

export default examService;
