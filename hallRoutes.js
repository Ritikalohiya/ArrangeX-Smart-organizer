
import express from "express";
import protect from "../middleware/authMiddleware.js";

import {
  createHall,
  bulkCreateHalls,
  getHalls,
  getHallById,
  getHallsByBuilding,
  updateHall,
  bulkUpdateHalls,
  deleteHall,
} from "../controllers/hallController.js";

const router = express.Router();

// Require authentication for all hall APIs
router.use(protect);

// Bulk routes
router.post("/bulk", bulkCreateHalls);
router.patch("/bulk", bulkUpdateHalls);

// Read routes
router.get("/", getHalls);
router.get("/building/:buildingId", getHallsByBuilding);
router.get("/:id", getHallById);

// Create, update, delete
router.post("/", createHall);
router.patch("/:id", updateHall);
router.put("/:id", updateHall);
router.delete("/:id", deleteHall);

console.log("Hall routes loaded successfully");

export default router;
