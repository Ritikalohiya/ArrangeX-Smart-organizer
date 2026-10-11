
import mongoose from "mongoose";
import Student from "../Models/Student.js";
import College from "../Models/College.js";

// Helper: consistent error response
const handleError = (res, error) => {
  console.error("Student API Error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID or field value",
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate student roll number or enrollment number",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

// Validate college ID and confirm it exists
const validateCollege = async (collegeId) => {
  if (!mongoose.isValidObjectId(collegeId)) {
    return false;
  }

  const college = await College.exists({ _id: collegeId });
  return Boolean(college);
};

// POST /api/students
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      enrollmentNumber,
      course,
      branch,
      semester,
      section,
      college,
      ...otherFields
    } = req.body || {};

    if (
      !name ||
      !rollNumber ||
      !course ||
      !branch ||
      semester === undefined ||
      semester === null ||
      semester === "" ||
      !college
    ) {
      return res.status(400).json({
        success: false,
        message:
          "name, rollNumber, course, branch, semester and college are required",
      });
    }

    if (!(await validateCollege(college))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing college",
      });
    }

    const normalizedRoll = String(rollNumber).trim();
    const normalizedEnrollment = enrollmentNumber
      ? String(enrollmentNumber).trim()
      : undefined;

    const duplicateConditions = [
      { rollNumber: normalizedRoll },
    ];

    if (normalizedEnrollment) {
      duplicateConditions.push({
        enrollmentNumber: normalizedEnrollment,
      });
    }

    if (await Student.exists({ $or: duplicateConditions })) {
      return res.status(409).json({
        success: false,
        message: "Roll number or enrollment number already exists",
      });
    }

    const student = await Student.create({
      name: String(name).trim(),
      rollNumber: normalizedRoll,
      ...(normalizedEnrollment
        ? { enrollmentNumber: normalizedEnrollment }
        : {}),
      course: String(course).trim(),
      branch: String(branch).trim(),
      semester: Number(semester),
      ...(section ? { section: String(section).trim() } : {}),
      college,
    });

    const data = await Student.findById(student._id)
      .populate("college", "name code");

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// POST /api/students/bulk
// Maximum 500 students per request
export const bulkCreateStudents = async (req, res) => {
  try {
    const { students } = req.body || {};

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a non-empty students array",
      });
    }

    if (students.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Maximum 500 students can be added at once",
      });
    }

    const requiredFields = [
      "name",
      "rollNumber",
      "course",
      "branch",
      "semester",
      "college",
    ];

    const rollNumbers = [];
    const enrollmentNumbers = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];

      if (!student || typeof student !== "object" || Array.isArray(student)) {
        return res.status(400).json({
          success: false,
          message: `Student at index ${i} must be an object`,
        });
      }

      for (const field of requiredFields) {
        if (
          student[field] === undefined ||
          student[field] === null ||
          String(student[field]).trim() === ""
        ) {
          return res.status(400).json({
            success: false,
            message: `Student at index ${i}: ${field} is required`,
          });
        }
      }

      if (!mongoose.isValidObjectId(student.college)) {
        return res.status(400).json({
          success: false,
          message: `Student at index ${i}: invalid college ID`,
        });
      }

      const semester = Number(student.semester);

      if (!Number.isInteger(semester) || semester < 1) {
        return res.status(400).json({
          success: false,
          message: `Student at index ${i}: invalid semester`,
        });
      }

      student.name = String(student.name).trim();
      student.rollNumber = String(student.rollNumber).trim();
      student.course = String(student.course).trim();
      student.branch = String(student.branch).trim();
      student.semester = semester;
      student.college = String(student.college);

      if (student.enrollmentNumber) {
        student.enrollmentNumber =
          String(student.enrollmentNumber).trim();
        enrollmentNumbers.push(student.enrollmentNumber);
      }

      if (student.section) {
        student.section = String(student.section).trim();
      }

      rollNumbers.push(student.rollNumber);
    }

    if (
      new Set(rollNumbers).size !== rollNumbers.length ||
      new Set(enrollmentNumbers).size !== enrollmentNumbers.length
    ) {
      return res.status(409).json({
        success: false,
        message: "Duplicate roll or enrollment numbers in request",
      });
    }

    const collegeIds = [
      ...new Set(students.map((student) => student.college)),
    ];

    const existingColleges = await College.find({
      _id: { $in: collegeIds },
    }).select("_id");

    const existingCollegeIds = new Set(
      existingColleges.map((college) => String(college._id))
    );

    const invalidCollege = collegeIds.find(
      (id) => !existingCollegeIds.has(id)
    );

    if (invalidCollege) {
      return res.status(400).json({
        success: false,
        message: `College not found: ${invalidCollege}`,
      });
    }

    const duplicateConditions = [
      { rollNumber: { $in: rollNumbers } },
    ];

    if (enrollmentNumbers.length > 0) {
      duplicateConditions.push({
        enrollmentNumber: { $in: enrollmentNumbers },
      });
    }

    const duplicates = await Student.find({
      $or: duplicateConditions,
    }).select("rollNumber enrollmentNumber");

    if (duplicates.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Some roll or enrollment numbers already exist",
        duplicates,
      });
    }

    const created = await Student.insertMany(students, {
      ordered: true,
    });

    const data = await Student.find({
      _id: { $in: created.map((student) => student._id) },
    }).populate("college", "name code");

    return res.status(201).json({
      success: true,
      message: `${data.length} students created successfully`,
      count: data.length,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/students
export const getStudents = async (req, res) => {
  try {
    const data = await Student.find()
      .populate("college", "name code")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// GET /api/students/:id
export const getStudentById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const data = await Student.findById(req.params.id)
      .populate("college", "name code");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// PATCH /api/students/:id and PUT /api/students/:id
export const updateStudent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const allowedFields = [
      "name",
      "rollNumber",
      "enrollmentNumber",
      "course",
      "branch",
      "semester",
      "section",
      "college",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one valid field to update",
      });
    }

    for (const field of [
      "name",
      "rollNumber",
      "enrollmentNumber",
      "course",
      "branch",
      "section",
    ]) {
      if (
        updates[field] !== undefined &&
        updates[field] !== null
      ) {
        updates[field] = String(updates[field]).trim();
      }
    }

    if (updates.semester !== undefined) {
      updates.semester = Number(updates.semester);

      if (
        !Number.isInteger(updates.semester) ||
        updates.semester < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid semester",
        });
      }
    }

    if (
      updates.college !== undefined &&
      !(await validateCollege(updates.college))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing college",
      });
    }

    if (updates.rollNumber || updates.enrollmentNumber) {
      const duplicateConditions = [];

      if (updates.rollNumber) {
        duplicateConditions.push({
          rollNumber: updates.rollNumber,
        });
      }

      if (updates.enrollmentNumber) {
        duplicateConditions.push({
          enrollmentNumber: updates.enrollmentNumber,
        });
      }

      const duplicate = await Student.findOne({
        _id: { $ne: req.params.id },
        $or: duplicateConditions,
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Roll number or enrollment number already exists",
        });
      }
    }

    const data = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("college", "name code");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// PATCH /api/students/bulk
export const bulkUpdateStudents = async (req, res) => {
  try {
    const { students } = req.body || {};

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a non-empty students array",
      });
    }

    if (students.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Maximum 500 students can be updated at once",
      });
    }

    const ids = students.map((student) => student?.id);

    if (ids.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({
        success: false,
        message: "Every student needs a valid id",
      });
    }

    if (new Set(ids.map(String)).size !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Duplicate student IDs in request",
      });
    }

    const allowedFields = [
      "name",
      "rollNumber",
      "enrollmentNumber",
      "course",
      "branch",
      "semester",
      "section",
      "college",
      "status",
    ];

    const results = [];

    for (const student of students) {
      const updates = {};

      for (const field of allowedFields) {
        if (student[field] !== undefined) {
          updates[field] = student[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: `No update fields supplied for student ${student.id}`,
        });
      }

      for (const field of [
        "name",
        "rollNumber",
        "enrollmentNumber",
        "course",
        "branch",
        "section",
      ]) {
        if (updates[field] !== undefined) {
          updates[field] = String(updates[field]).trim();
        }
      }

      if (updates.semester !== undefined) {
        updates.semester = Number(updates.semester);

        if (
          !Number.isInteger(updates.semester) ||
          updates.semester < 1
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid semester for student ${student.id}`,
          });
        }
      }

      if (
        updates.college !== undefined &&
        !(await validateCollege(updates.college))
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid college for student ${student.id}`,
        });
      }

      const updated = await Student.findByIdAndUpdate(
        student.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: `Student not found: ${student.id}`,
        });
      }

      results.push(updated);
    }

    const data = await Student.find({
      _id: { $in: results.map((student) => student._id) },
    }).populate("college", "name code");

    return res.status(200).json({
      success: true,
      message: `${data.length} students updated successfully`,
      count: data.length,
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// DELETE /api/students/:id
export const deleteStudent = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const data = await Student.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data,
    });
  } catch (error) {
    return handleError(res, error);
  }
};
