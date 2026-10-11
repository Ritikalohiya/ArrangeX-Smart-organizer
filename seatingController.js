import Student from "../Models/Student.js";
import Hall from "../Models/Hall.js";
import Exam from "../Models/Exam.js";
import SeatingArrangement from "../Models/SeatingArrangement.js";

// ==========================================
// GENERATE SEATING
// POST /api/seating/generate
// ==========================================
export const generateSeating = async (req, res) => {
  try {
    const { examId, hallIds } = req.body;

    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      });
    }

    if (!Array.isArray(hallIds) || hallIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one hall",
      });
    }

    // ------------------------------------------
    // FIND EXAM
    // ------------------------------------------

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // ------------------------------------------
    // FIND HALLS
    // ------------------------------------------

    const halls = await Hall.find({
      _id: { $in: hallIds },
      status: {
        $ne: "maintenance",
      },
    });

    if (halls.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No available halls found",
      });
    }

    // ------------------------------------------
    // FIND STUDENTS
    // ------------------------------------------

    const students = await Student.find({
      college: exam.college,
      semester: exam.semester,
      course: exam.course,
      status: "active",
    }).sort({
      rollNumber: 1,
    });

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No students found for this exam",
      });
    }

    // ------------------------------------------
    // TOTAL CAPACITY
    // ------------------------------------------

    const totalSeats = halls.reduce(
      (sum, hall) => sum + Number(hall.capacity),
      0
    );

    if (totalSeats < students.length) {
      return res.status(400).json({
        success: false,
        message: "Not enough seats available",
        students: students.length,
        availableSeats: totalSeats,
      });
    }

    // ------------------------------------------
    // GENERATE ASSIGNMENTS
    // ------------------------------------------

    const assignments = [];

    let studentIndex = 0;

    for (const hall of halls) {
      for (
        let row = 1;
        row <= hall.rows;
        row++
      ) {
        for (
          let column = 1;
          column <= hall.columns;
          column++
        ) {
          if (studentIndex >= students.length) {
            break;
          }

          const student = students[studentIndex];

          assignments.push({
            student: student._id,
            hall: hall._id,
            seatNumber: `${hall.hallNumber}-${row}-${column}`,
            row,
            column,
          });

          studentIndex++;
        }

        if (studentIndex >= students.length) {
          break;
        }
      }

      if (studentIndex >= students.length) {
        break;
      }
    }

    // ------------------------------------------
    // SAVE ARRANGEMENT
    // ------------------------------------------

    const seating = await SeatingArrangement.create({
      exam: exam._id,
      halls: halls.map((hall) => hall._id),
      assignments,
      totalStudents: students.length,
      totalSeats,
      status: "generated",
    });

    // ------------------------------------------
    // POPULATE RESULT
    // ------------------------------------------

    const result =
      await SeatingArrangement.findById(
        seating._id
      )
        .populate("exam")
        .populate("halls")
        .populate("assignments.student");

    res.status(201).json({
      success: true,
      message:
        "Seating arrangement generated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL SEATING ARRANGEMENTS
// GET /api/seating
// ==========================================
export const getSeatingArrangements = async (
  req,
  res
) => {
  try {
    const arrangements =
      await SeatingArrangement.find()
        .populate("exam")
        .populate("halls")
        .populate("assignments.student")
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: arrangements.length,
      data: arrangements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SEATING BY ID
// GET /api/seating/:id
// ==========================================
export const getSeatingById = async (req, res) => {
  try {
    const seating =
      await SeatingArrangement.findById(
        req.params.id
      )
        .populate("exam")
        .populate("halls")
        .populate("assignments.student");

    if (!seating) {
      return res.status(404).json({
        success: false,
        message:
          "Seating arrangement not found",
      });
    }

    res.status(200).json({
      success: true,
      data: seating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE SEATING
// DELETE /api/seating/:id
// ==========================================
export const deleteSeating = async (req, res) => {
  try {
    const seating =
      await SeatingArrangement.findByIdAndDelete(
        req.params.id
      );

    if (!seating) {
      return res.status(404).json({
        success: false,
        message:
          "Seating arrangement not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Seating arrangement deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};