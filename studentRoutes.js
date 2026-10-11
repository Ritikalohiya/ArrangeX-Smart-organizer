
import express from "express";

import {
  createStudent,
  bulkCreateStudents,
  getStudents,
  getStudentById,
  updateStudent,
  bulkUpdateStudents,
  deleteStudent,
} from "../Controllers/studentController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All student endpoints require a valid JWT
router.use(protect);

// Bulk routes must be before /:id routes
router.post("/bulk", bulkCreateStudents);
router.patch("/bulk", bulkUpdateStudents);

// Get all students
router.get("/", getStudents);

// Create one student
router.post("/", createStudent);

// Get one student
router.get("/:id", getStudentById);

// Update one student
router.patch("/:id", updateStudent);
router.put("/:id", updateStudent);

// Delete one student
router.delete("/:id", deleteStudent);

export default router;
