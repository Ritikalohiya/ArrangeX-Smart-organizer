import mongoose from "mongoose";
import Building from "../models/Building.js";
import College from "../models/College.js";

// ==========================================
// HELPER: VALIDATE BUILDING DATA
// ==========================================
const validateBuildingData = (data, partial = false) => {
  const allowedFields = ["name", "code", "college", "floor"];
  const normalized = {};

  for (const key of Object.keys(data)) {
    if (!allowedFields.includes(key)) {
      return { error: `Invalid field: ${key}` };
    }
  }

  if (!partial) {
    for (const field of allowedFields) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
      ) {
        return { error: `${field} is required` };
      }
    }
  }

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      return { error: "Name must be a non-empty string" };
    }
    normalized.name = data.name.trim();
  }

  if (data.code !== undefined) {
    if (typeof data.code !== "string" || !data.code.trim()) {
      return { error: "Code must be a non-empty string" };
    }
    normalized.code = data.code.trim().toUpperCase();
  }

  if (data.college !== undefined) {
    if (!mongoose.isValidObjectId(data.college)) {
      return { error: "Invalid college ID" };
    }
    normalized.college = data.college;
  }

  if (data.floor !== undefined) {
    const floor = Number(data.floor);

    if (
      data.floor === null ||
      data.floor === "" ||
      !Number.isFinite(floor) ||
      floor < 0
    ) {
      return { error: "Floor must be a non-negative number" };
    }

    normalized.floor = floor;
  }

  return { data: normalized };
};

// ==========================================
// HELPER: CHECK COLLEGE REFERENCES
// ==========================================
const checkColleges = async (collegeIds) => {
  const ids = [...new Set(collegeIds.map(String))];

  if (!ids.length) return true;

  const colleges = await College.find({
    _id: { $in: ids },
  }).select("_id");

  return colleges.length === ids.length;
};

// ==========================================
// CREATE ONE BUILDING
// POST /api/buildings
// ==========================================
export const createBuilding = async (req, res) => {
  try {
    const validation = validateBuildingData(req.body);

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const data = validation.data;

    if (!(await checkColleges([data.college]))) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const building = await Building.create(data);

    const result = await Building.findById(building._id)
      .populate("college", "name code");

    return res.status(201).json({
      success: true,
      message: "Building created successfully",
      data: result,
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? "Building code already exists"
          : error.message,
    });
  }
};

// ==========================================
// BULK CREATE BUILDINGS
// POST /api/buildings/bulk
// ==========================================
export const bulkCreateBuildings = async (req, res) => {
  try {
    const { buildings } = req.body;

    if (!Array.isArray(buildings) || buildings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a non-empty buildings array",
      });
    }

    const normalizedBuildings = [];

    for (const item of buildings) {
      const validation = validateBuildingData(item || {});

      if (validation.error) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      normalizedBuildings.push(validation.data);
    }

    const codes = normalizedBuildings.map((b) => b.code);

    if (new Set(codes).size !== codes.length) {
      return res.status(409).json({
        success: false,
        message: "Duplicate building codes in request",
      });
    }

    const validColleges = await checkColleges(
      normalizedBuildings.map((b) => b.college)
    );

    if (!validColleges) {
      return res.status(404).json({
        success: false,
        message: "One or more colleges were not found",
      });
    }

    const existing = await Building.find({
      code: { $in: codes },
    }).select("code");

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "One or more building codes already exist",
        codes: existing.map((b) => b.code),
      });
    }

    const created = await Building.insertMany(normalizedBuildings);

    const result = await Building.find({
      _id: { $in: created.map((b) => b._id) },
    }).populate("college", "name code");

    return res.status(201).json({
      success: true,
      message: "Buildings created successfully",
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? "A building code already exists"
          : error.message,
    });
  }
};

// ==========================================
// GET ALL BUILDINGS
// GET /api/buildings
// ==========================================
export const getBuildings = async (req, res) => {
  try {
    const buildings = await Building.find()
      .populate("college", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: buildings.length,
      data: buildings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET BUILDINGS BY COLLEGE
// GET /api/buildings/college/:collegeId
// ==========================================
export const getBuildingsByCollege = async (req, res) => {
  try {
    const { collegeId } = req.params;

    if (!mongoose.isValidObjectId(collegeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID",
      });
    }

    const college = await College.findById(collegeId);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    const buildings = await Building.find({ college: collegeId })
      .populate("college", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: buildings.length,
      data: buildings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET BUILDING BY ID
// GET /api/buildings/:id
// ==========================================
export const getBuildingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid building ID",
      });
    }

    const building = await Building.findById(id)
      .populate("college", "name code");

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: building,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE ONE BUILDING
// PATCH /api/buildings/:id
// PUT /api/buildings/:id
// ==========================================
export const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid building ID",
      });
    }

    const validation = validateBuildingData(
      req.body,
      req.method === "PATCH"
    );

    if (validation.error) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const data = validation.data;

    if (data.college && !(await checkColleges([data.college]))) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    if (data.code) {
      const duplicate = await Building.findOne({
        code: data.code,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Building code already exists",
        });
      }
    }

    const building = await Building.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate("college", "name code");

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Building updated successfully",
      data: building,
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? "Building code already exists"
          : error.message,
    });
  }
};

// ==========================================
// BULK UPDATE BUILDINGS
// PATCH /api/buildings/bulk
// ==========================================
export const bulkUpdateBuildings = async (req, res) => {
  try {
    const { buildings } = req.body;

    if (!Array.isArray(buildings) || buildings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a non-empty buildings array",
      });
    }

    const ids = [];
    const updates = [];

    for (const item of buildings) {
      if (!item || !mongoose.isValidObjectId(item.id)) {
        return res.status(400).json({
          success: false,
          message: "Each building requires a valid id",
        });
      }

      const { id, ...fields } = item;
      const validation = validateBuildingData(fields, true);

      if (validation.error) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      if (!Object.keys(validation.data).length) {
        return res.status(400).json({
          success: false,
          message: `No update fields provided for ${id}`,
        });
      }

      ids.push(String(id));
      updates.push({ id, data: validation.data });
    }

    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate building IDs are not allowed",
      });
    }

    const foundBuildings = await Building.find({
      _id: { $in: ids },
    }).select("_id");

    if (foundBuildings.length !== ids.length) {
      return res.status(404).json({
        success: false,
        message: "One or more buildings were not found",
      });
    }

    const collegeIds = updates
      .filter((item) => item.data.college)
      .map((item) => item.data.college);

    if (!(await checkColleges(collegeIds))) {
      return res.status(404).json({
        success: false,
        message: "One or more colleges were not found",
      });
    }

    // Check duplicate codes in this batch
    const codeUpdates = updates.filter((item) => item.data.code);
    const requestedCodes = codeUpdates.map((item) => item.data.code);

    if (new Set(requestedCodes).size !== requestedCodes.length) {
      return res.status(409).json({
        success: false,
        message: "Duplicate building codes in request",
      });
    }

    // Check if requested codes belong to buildings outside this batch
    const duplicates = await Building.find({
      code: { $in: requestedCodes },
      _id: { $nin: ids },
    }).select("code");

    if (duplicates.length) {
      return res.status(409).json({
        success: false,
        message: "One or more building codes already exist",
        codes: duplicates.map((b) => b.code),
      });
    }

    await Promise.all(
      updates.map(({ id, data }) =>
        Building.findByIdAndUpdate(
          id,
          { $set: data },
          { new: true, runValidators: true }
        )
      )
    );

    const result = await Building.find({
      _id: { $in: ids },
    }).populate("college", "name code");

    return res.status(200).json({
      success: true,
      message: "Buildings updated successfully",
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message:
        error.code === 11000
          ? "Building code already exists"
          : error.message,
    });
  }
};

// ==========================================
// DELETE ONE BUILDING
// DELETE /api/buildings/:id
// ==========================================
export const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid building ID",
      });
    }

    const building = await Building.findByIdAndDelete(id);

    if (!building) {
      return res.status(404).json({
        success: false,
        message: "Building not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Building deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};