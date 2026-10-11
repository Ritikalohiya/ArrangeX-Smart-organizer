
import mongoose from "mongoose";
import College from "../models/College.js";

const ALLOWED_FIELDS = [
  "name",
  "code",
  "address",
  "email",
  "phone",
];

const normalizeCollege = (data = {}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("College data must be an object");
  }

  const invalidFields = Object.keys(data).filter(
    (field) => !ALLOWED_FIELDS.includes(field)
  );

  if (invalidFields.length) {
    throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
  }

  const result = {};

  for (const field of ALLOWED_FIELDS) {
    if (data[field] === undefined) continue;

    if (typeof data[field] !== "string" || !data[field].trim()) {
      throw new Error(`${field} must be a non-empty string`);
    }

    result[field] = data[field].trim();
  }

  if (result.code) result.code = result.code.toUpperCase();
  if (result.email) result.email = result.email.toLowerCase();

  return result;
};

const handleError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "College code or email already exists",
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || "Something went wrong",
  });
};

const validId = (id) => mongoose.isValidObjectId(id);

const validateRequiredFields = (data) => {
  for (const field of ALLOWED_FIELDS) {
    if (!data[field]) throw new Error(`${field} is required`);
  }
};

// CREATE ONE
// POST /api/colleges
export const createCollege = async (req, res) => {
  try {
    const data = normalizeCollege(req.body);
    validateRequiredFields(data);

    const college = await College.create(data);

    return res.status(201).json({
      success: true,
      message: "College created successfully",
      college,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// BULK CREATE
// POST /api/colleges/bulk
export const bulkCreateColleges = async (req, res) => {
  try {
    // Accept either { colleges: [...] } or a direct array
    const colleges = Array.isArray(req.body)
      ? req.body
      : req.body?.colleges;

    if (!Array.isArray(colleges) || colleges.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Send a non-empty JSON array or { colleges: [...] }",
      });
    }

    const prepared = colleges.map((item) => {
      const data = normalizeCollege(item);
      validateRequiredFields(data);
      return data;
    });

    for (const field of ["code", "email"]) {
      const values = prepared.map((item) => item[field]);

      if (new Set(values).size !== values.length) {
        return res.status(409).json({
          success: false,
          message: `Duplicate ${field} values in request`,
        });
      }
    }

    const existing = await College.find({
      $or: [
        { code: { $in: prepared.map((item) => item.code) } },
        { email: { $in: prepared.map((item) => item.email) } },
      ],
    }).select("name code email");

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Some college codes or emails already exist",
        existing,
      });
    }

    const created = await College.insertMany(prepared);

    return res.status(201).json({
      success: true,
      message: "Colleges created successfully",
      count: created.length,
      colleges: created,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET ALL
// GET /api/colleges
export const getColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: colleges.length,
      colleges,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET BY ID
// GET /api/colleges/:id
export const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID",
      });
    }

    const college = await College.findById(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    return res.status(200).json({ success: true, college });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE ONE
// PATCH /api/colleges/:id
export const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID",
      });
    }

    const data = normalizeCollege(req.body);

    if (!Object.keys(data).length) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const college = await College.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "College updated successfully",
      college,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// BULK UPDATE
// PATCH /api/colleges/bulk
export const bulkUpdateColleges = async (req, res) => {
  try {
    const colleges = Array.isArray(req.body)
      ? req.body
      : req.body?.colleges;

    if (!Array.isArray(colleges) || colleges.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Send a non-empty JSON array or { colleges: [...] }",
      });
    }

    const ids = new Set();
    const updates = [];

    for (const item of colleges) {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item) ||
        !validId(item.id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Every college must have a valid id",
        });
      }

      const id = String(item.id);

      if (ids.has(id)) {
        return res.status(400).json({
          success: false,
          message: `Duplicate college ID: ${id}`,
        });
      }

      const fields = Object.fromEntries(
        Object.entries(item).filter(([key]) => key !== "id")
      );

      const data = normalizeCollege(fields);

      if (!Object.keys(data).length) {
        return res.status(400).json({
          success: false,
          message: `No update fields provided for ${id}`,
        });
      }

      ids.add(id);
      updates.push({ id, data });
    }

    const idList = [...ids];

    const existing = await College.find({
      _id: { $in: idList },
    }).select("_id");

    if (existing.length !== idList.length) {
      return res.status(404).json({
        success: false,
        message: "One or more colleges were not found",
      });
    }

    // Check duplicate values among the requested updates
    for (const field of ["code", "email"]) {
      const values = updates
        .map(({ data }) => data[field])
        .filter((value) => value !== undefined);

      if (new Set(values).size !== values.length) {
        return res.status(409).json({
          success: false,
          message: `Duplicate ${field} values in request`,
        });
      }
    }

    // Check conflicts with records not included in this batch
    for (const field of ["code", "email"]) {
      const values = [
        ...new Set(
          updates
            .map(({ data }) => data[field])
            .filter((value) => value !== undefined)
        ),
      ];

      if (!values.length) continue;

      const conflict = await College.findOne({
        [field]: { $in: values },
        _id: { $nin: idList },
      }).select("_id");

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `${field} already exists in another college`,
        });
      }
    }

    const updated = await Promise.all(
      updates.map(({ id, data }) =>
        College.findByIdAndUpdate(
          id,
          { $set: data },
          { new: true, runValidators: true }
        )
      )
    );

    return res.status(200).json({
      success: true,
      message: "Colleges updated successfully",
      count: updated.length,
      colleges: updated,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE ONE
// DELETE /api/colleges/:id
export const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID",
      });
    }

    const college = await College.findByIdAndDelete(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: "College not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "College deleted successfully",
      college,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
