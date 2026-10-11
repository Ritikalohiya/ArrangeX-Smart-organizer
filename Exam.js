import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },

    subjectCode: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    semester: {
      type: Number,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    totalStudents: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
    },

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Exam", examSchema);