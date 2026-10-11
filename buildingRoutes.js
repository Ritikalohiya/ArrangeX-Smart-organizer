
import express from "express";

import {
  createBuilding,
  bulkCreateBuildings,
  getBuildings,
  getBuildingsByCollege,
  getBuildingById,
  updateBuilding,
  bulkUpdateBuildings,
  deleteBuilding,
} from "../Controllers/buildingController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Protect all building routes
router.use(protect);

// Bulk routes
router.post("/bulk", bulkCreateBuildings);
router.patch("/bulk", bulkUpdateBuildings);

// Get routes
router.get("/", getBuildings);
router.get("/college/:collegeId", getBuildingsByCollege);
router.get("/:id", getBuildingById);

// Create, update and delete
router.post("/", createBuilding);
router.patch("/:id", updateBuilding);
router.put("/:id", updateBuilding);
router.delete("/:id", deleteBuilding);

export default router;
