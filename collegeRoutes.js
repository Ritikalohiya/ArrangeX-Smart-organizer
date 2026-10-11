
import express from "express";

import {
  createCollege,
  bulkCreateColleges,
  getColleges,
  getCollegeById,
  updateCollege,
  bulkUpdateColleges,
  deleteCollege,
} from "../Controllers/collegeController.js";

import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

// Authentication
router.use(protect);

// CREATE
router.post("/bulk", bulkCreateColleges);
router.post("/", createCollege);

// READ
router.get("/", getColleges);
router.get("/:id", getCollegeById);

// UPDATE
router.patch("/bulk", bulkUpdateColleges);
router.patch("/:id", updateCollege);

// DELETE
router.delete("/:id", deleteCollege);

export default router;
