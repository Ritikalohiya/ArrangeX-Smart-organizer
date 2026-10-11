
import mongoose from "mongoose";
import Exam from "../Models/Exam.js";
import College from "../Models/College.js";

// ==========================================
// CREATE EXAM
// POST /api/exams
// ==========================================
export const createExam = async (req, res) => {
  try {
    const {
      subject,
      subjectCode,
      date,
      startTime,
      endTime,
      semester,
      course,
      totalStudents,
      status,
      college,
    } = req.body || {};

    // Validate required fields
    if (
      !subject?.trim() ||
      !subjectCode?.trim() ||
      !date ||
      !startTime ||
      !endTime ||
      semester === undefined ||
      semester === "" ||
      !course?.trim() ||
      totalStudents === undefined ||
      totalStudents === "" ||
      !college
    ) {
      return res.status(400).json({
        success: false,
        message: "All required exam fields must be provided.",
      });
    }

    // Validate college ID
    if (!mongoose.isValidObjectId(college)) {
      return res.status(400).json({
        success: false,
        message: "Invalid college ID.",
      });
    }

    const semesterNumber = Number(semester);
    const studentCount = Number(totalStudents);

    if (
      !Number.isInteger(semesterNumber) ||
      semesterNumber < 1 ||
      semesterNumber > 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Semester must be between 1 and 8.",
      });
    }

    if (!Number.isInteger(studentCount) || studentCount < 0) {
      return res.status(400).json({
        success: false,
        message: "Total students must be a non-negative integer.",
      });
    }

    // Validate time range (HH:mm format)
    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
      !timePattern.test(startTime) ||
      !timePattern.test(endTime) ||
      endTime <= startTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid start and end times.",
      });
    }

    // Verify college exists
    const collegeExists = await College.findById(college);

    if (!collegeExists) {
      return res.status(404).json({
        success: false,
        message: "College not found.",
      });
    }

    const exam = await Exam.create({
      subject: subject.trim(),
      subjectCode: subjectCode.trim(),
      date,
      startTime,
      endTime,
      semester: semesterNumber,
      course: course.trim(),
      totalStudents: studentCount,
      ...(status ? { status } : {}),
      college,
    });

    const createdExam = await Exam.findById(exam._id)
      .populate("college", "name code");

    return res.status(201).json({
      success: true,
      message: "Exam created successfully.",
      data: createdExam,
    });
  } catch (error) {
    console.error("Create exam error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create exam.",
    });
  }
};

// ==========================================
// GET ALL EXAMS
// GET /api/exams
// ==========================================
export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("college", "name code")
      .sort({ date: 1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    console.error("Get exams error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exams.",
    });
  }
};

// ==========================================
// GET EXAM BY ID
// GET /api/exams/:id
// ==========================================
export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const exam = await Exam.findById(id)
      .populate("college", "name code");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    console.error("Get exam by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam.",
    });
  }
};

// ==========================================
// UPDATE EXAM
// PUT /api/exams/:id
// ==========================================
export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const allowedFields = [
      "subject",
      "subjectCode",
      "date",
      "startTime",
      "endTime",
      "semester",
      "course",
      "totalStudents",
      "status",
      "college",
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
        message: "No valid fields provided for update.",
      });
    }

    if (updates.college !== undefined) {
      if (!mongoose.isValidObjectId(updates.college)) {
        return res.status(400).json({
          success: false,
          message: "Invalid college ID.",
        });
      }

      const collegeExists = await College.findById(updates.college);

      if (!collegeExists) {
        return res.status(404).json({
          success: false,
          message: "College not found.",
        });
      }
    }

    if (updates.semester !== undefined) {
      updates.semester = Number(updates.semester);

      if (
        !Number.isInteger(updates.semester) ||
        updates.semester < 1 ||
        updates.semester > 8
      ) {
        return res.status(400).json({
          success: false,
          message: "Semester must be between 1 and 8.",
        });
      }
    }

    if (updates.totalStudents !== undefined) {
      updates.totalStudents = Number(updates.totalStudents);

      if (
        !Number.isInteger(updates.totalStudents) ||
        updates.totalStudents < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Total students must be a non-negative integer.",
        });
      }
    }

    for (const field of ["subject", "subjectCode", "course"]) {
      if (updates[field] !== undefined) {
        if (
          typeof updates[field] !== "string" ||
          !updates[field].trim()
        ) {
          return res.status(400).json({
            success: false,
            message: `${field} cannot be empty.`,
          });
        }

        updates[field] = updates[field].trim();
      }
    }

    if (
      updates.startTime !== undefined &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(updates.startTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time.",
      });
    }

    if (
      updates.endTime !== undefined &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(updates.endTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid end time.",
      });
    }

    const existingExam = await Exam.findById(id);

    if (!existingExam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    const finalStartTime =
      updates.startTime ?? existingExam.startTime;
    const finalEndTime =
      updates.endTime ?? existingExam.endTime;

    if (finalEndTime <= finalStartTime) {
      return res.status(400).json({
        success: false,
        message: "End time must be later than start time.",
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("college", "name code");

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully.",
      data: updatedExam,
    });
  } catch (error) {
    console.error("Update exam error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update exam.",
    });
  }
};

// ==========================================
// DELETE EXAM
// DELETE /api/exams/:id
// ==========================================
export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID.",
      });
    }

    const exam = await Exam.findByIdAndDelete(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully.",
    });
  } catch (error) {
    console.error("Delete exam error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete exam.",
    });
  }
};
