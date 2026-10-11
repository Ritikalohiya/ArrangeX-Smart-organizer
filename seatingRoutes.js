import express from "express";

import {
  generateSeating,
  getSeatingArrangements,
  getSeatingById,
  deleteSeating,
} from "../Controllers/seatingController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL
router.get("/", protect, getSeatingArrangements);

// GET BY ID
router.get("/:id", protect, getSeatingById);

// GENERATE
router.post(
  "/generate",
  protect,
  generateSeating
);

// DELETE
router.delete(
  "/:id",
  protect,
  deleteSeating
);

export default router;