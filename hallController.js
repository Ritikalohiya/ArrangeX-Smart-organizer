
import mongoose from "mongoose";
import Hall from "../models/Hall.js";
import Building from "../models/Building.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const normalizeHall = (data) => {
  const result = { ...data };

  if (typeof result.name === "string") {
    result.name = result.name.trim();
  }

  if (typeof result.code === "string") {
    result.code = result.code.trim().toUpperCase();
  }

  for (const field of ["floor", "capacity", "rows", "columns"]) {
    if (result[field] !== undefined) {
      result[field] = Number(result[field]);
    }
  }

  return result;
};

const validateHall = (data) => {
  const {
    name, code, building, floor,
    capacity, rows, columns, status
  } = data;

  if (
    !name ||
    !code ||
    !building ||
    floor === undefined ||
    capacity === undefined ||
    rows === undefined ||
    columns === undefined
  ) {
    return "Name, code, building, floor, capacity, rows and columns are required.";
  }

  if (
    !Number.isInteger(floor) || floor < 0 ||
    !Number.isInteger(capacity) || capacity < 1 ||
    !Number.isInteger(rows) || rows < 1 ||
    !Number.isInteger(columns) || columns < 1
  ) {
    return "Invalid floor, capacity, rows or columns.";
  }

  if (capacity > rows * columns) {
    return "Capacity cannot exceed rows × columns.";
  }

  if (
    status !== undefined &&
    !["Available", "Occupied", "Maintenance"].includes(status)
  ) {
    return "Invalid hall status.";
  }

  return null;
};

const validateBuilding = async (buildingId) => {
  if (!isValidId(buildingId)) return false;
  return Boolean(await Building.exists({ _id: buildingId }));
};

// CREATE SINGLE HALL
export const createHall = async (req, res) => {
  try {
    const data = normalizeHall(req.body);
    const error = validateHall(data);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    if (!(await validateBuilding(data.building))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or nonexistent building ID."
      });
    }

    const hall = await Hall.create(data);

    return res.status(201).json({
      success: true,
      message: "Hall created successfully.",
      hall
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000
        ? "Hall code already exists."
        : error.message
    });
  }
};

// BULK CREATE HALLS
export const bulkCreateHalls = async (req, res) => {
  try {
    const { halls } = req.body;

    if (!Array.isArray(halls) || halls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Send a non-empty halls array."
      });
    }

    if (halls.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Maximum 500 halls per request."
      });
    }

    const data = halls.map(normalizeHall);
    const codes = data.map((hall) => hall.code);

    for (let i = 0; i < data.length; i++) {
      const error = validateHall(data[i]);

      if (error) {
        return res.status(400).json({
          success: false,
          message: `Hall ${i + 1}: ${error}`
        });
      }

      if (!(await validateBuilding(data[i].building))) {
        return res.status(400).json({
          success: false,
          message: `Hall ${i + 1}: invalid or nonexistent building ID.`
        });
      }
    }

    if (new Set(codes).size !== codes.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate hall codes in request."
      });
    }

    const existing = await Hall.find({
      code: { $in: codes }
    }).select("code");

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Some hall codes already exist.",
        duplicateCodes: existing.map((hall) => hall.code)
      });
    }

    const created = await Hall.insertMany(data);

    return res.status(201).json({
      success: true,
      message: `${created.length} halls created successfully.`,
      count: created.length,
      halls: created
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000
        ? "A hall code already exists."
        : error.message
    });
  }
};

// GET ALL HALLS
export const getHalls = async (req, res) => {
  try {
    const filter = {};

    if (req.query.building) {
      if (!isValidId(req.query.building)) {
        return res.status(400).json({
          success: false,
          message: "Invalid building ID."
        });
      }

      filter.building = req.query.building;
    }

    if (req.query.status) filter.status = req.query.status;

    const halls = await Hall.find(filter)
      .populate("building", "name code")
      .sort({ code: 1 });

    return res.status(200).json({
      success: true,
      count: halls.length,
      halls
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET HALLS BY BUILDING
export const getHallsByBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;

    if (!(await validateBuilding(buildingId))) {
      return res.status(404).json({
        success: false,
        message: "Building not found or invalid ID."
      });
    }

    const halls = await Hall.find({ building: buildingId })
      .populate("building", "name code")
      .sort({ code: 1 });

    return res.status(200).json({
      success: true,
      count: halls.length,
      halls
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE HALL
export const getHallById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hall ID."
      });
    }

    const hall = await Hall.findById(req.params.id)
      .populate("building", "name code");

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found."
      });
    }

    return res.status(200).json({
      success: true,
      hall
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE SINGLE HALL
export const updateHall = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hall ID."
      });
    }

    const current = await Hall.findById(id);

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Hall not found."
      });
    }

    const allowed = [
      "name", "code", "building", "floor",
      "capacity", "rows", "columns", "status"
    ];

    const updates = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const data = normalizeHall({
      name: current.name,
      code: current.code,
      building: current.building,
      floor: current.floor,
      capacity: current.capacity,
      rows: current.rows,
      columns: current.columns,
      status: current.status,
      ...updates
    });

    const error = validateHall(data);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error
      });
    }

    if (!(await validateBuilding(data.building))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or nonexistent building ID."
      });
    }

    const hall = await Hall.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).populate("building", "name code");

    return res.status(200).json({
      success: true,
      message: "Hall updated successfully.",
      hall
    });
  } catch (error) {
    return res.status(error.code === 11000 ? 409 : 500).json({
      success: false,
      message: error.code === 11000
        ? "Hall code already exists."
        : error.message
    });
  }
};

// BULK UPDATE HALLS
export const bulkUpdateHalls = async (req, res) => {
  try {
    const { halls } = req.body;

    if (!Array.isArray(halls) || halls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Send a non-empty halls array."
      });
    }

    const results = [];

    for (const item of halls) {
      if (!item.id || !isValidId(item.id)) {
        results.push({
          id: item.id ?? null,
          success: false,
          message: "Valid hall ID is required."
        });
        continue;
      }

      try {
        const current = await Hall.findById(item.id);

        if (!current) {
          results.push({
            id: item.id,
            success: false,
            message: "Hall not found."
          });
          continue;
        }

        const allowed = [
          "name", "code", "building", "floor",
          "capacity", "rows", "columns", "status"
        ];

        const updates = {};

        for (const field of allowed) {
          if (item[field] !== undefined) {
            updates[field] = item[field];
          }
        }

        if (!Object.keys(updates).length) {
          results.push({
            id: item.id,
            success: false,
            message: "No fields provided to update."
          });
          continue;
        }

        const data = normalizeHall({
          name: current.name,
          code: current.code,
          building: current.building,
          floor: current.floor,
          capacity: current.capacity,
          rows: current.rows,
          columns: current.columns,
          status: current.status,
          ...updates
        });

        const error = validateHall(data);

        if (error) {
          results.push({
            id: item.id,
            success: false,
            message: error
          });
          continue;
        }

        if (!(await validateBuilding(data.building))) {
          results.push({
            id: item.id,
            success: false,
            message: "Invalid building ID."
          });
          continue;
        }

        const hall = await Hall.findByIdAndUpdate(item.id, data, {
          new: true,
          runValidators: true
        });

        results.push({
          id: item.id,
          success: true,
          hall
        });
      } catch (error) {
        results.push({
          id: item.id,
          success: false,
          message: error.message
        });
      }
    }

    const updatedCount = results.filter((item) => item.success).length;

    return res.status(200).json({
      success: updatedCount === results.length,
      message: `${updatedCount} of ${results.length} halls updated.`,
      results
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE SINGLE HALL
export const deleteHall = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hall ID."
      });
    }

    const hall = await Hall.findByIdAndDelete(req.params.id);

    if (!hall) {
      return res.status(404).json({
        success: false,
        message: "Hall not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hall deleted successfully."
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
