import College from "../Models/College.js";
import Building from "../Models/Building.js";
import Hall from "../Models/Hall.js";
import Student from "../Models/Student.js";
import Exam from "../Models/Exam.js";
import SeatingArrangement from "../Models/SeatingArrangement.js";

// ==========================================
// DASHBOARD STATS
// GET /api/dashboard/stats
// ==========================================
export const getDashboardStats = async (
  req,
  res
) => {
  try {
    const [
      colleges,
      buildings,
      halls,
      students,
      exams,
      seatingArrangements,
    ] = await Promise.all([
      College.countDocuments(),
      Building.countDocuments(),
      Hall.countDocuments(),
      Student.countDocuments(),
      Exam.countDocuments(),
      SeatingArrangement.countDocuments(),
    ]);

    const seatResult = await Hall.aggregate([
      {
        $group: {
          _id: null,
          totalSeats: {
            $sum: "$capacity",
          },
        },
      },
    ]);

    const totalSeats =
      seatResult.length > 0
        ? seatResult[0].totalSeats
        : 0;

    res.status(200).json({
      success: true,
      data: {
        colleges,
        buildings,
        halls,
        students,
        exams,
        seatingArrangements,
        totalSeats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// RECENT ACTIVITIES
// GET /api/dashboard/recent-activities
// ==========================================
export const getRecentActivities = async (
  req,
  res
) => {
  try {
    const [
      recentColleges,
      recentBuildings,
      recentStudents,
      recentExams,
      recentSeatings,
    ] = await Promise.all([
      College.find()
        .sort({ createdAt: -1 })
        .limit(5),

      Building.find()
        .populate("college", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      Student.find()
        .populate("college", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      Exam.find()
        .populate("college", "name")
        .sort({ createdAt: -1 })
        .limit(5),

      SeatingArrangement.find()
        .populate("exam", "subject")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        colleges: recentColleges,
        buildings: recentBuildings,
        students: recentStudents,
        exams: recentExams,
        seatingArrangements: recentSeatings,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};