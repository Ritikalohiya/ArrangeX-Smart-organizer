
import express from "express";

import {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
} from "../Controllers/examController.js";

import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all exams
router.get("/", getExams);

// Get exam by ID
router.get("/:id", getExamById);

// Create exam
router.post("/", createExam);

// Update exam
router.put("/:id", updateExam);

// Partially update exam
router.patch("/:id", updateExam);

// Delete exam
router.delete("/:id", deleteExam);

export default router;
