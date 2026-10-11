import mongoose from "mongoose";

const seatAssignmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
    },

    seatNumber: {
      type: String,
      required: true,
    },

    row: {
      type: Number,
      required: true,
    },

    column: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const seatingArrangementSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    halls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hall",
      },
    ],

    assignments: [seatAssignmentSchema],

    totalStudents: {
      type: Number,
      default: 0,
    },

    totalSeats: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["generated", "confirmed", "completed"],
      default: "generated",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "SeatingArrangement",
  seatingArrangementSchema
);