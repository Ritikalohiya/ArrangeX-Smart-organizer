
import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },

    code: {
      type: String,
      required: [true, "College code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    address: {
      type: String,
      required: [true, "College address is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "College email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: [true, "College phone is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);
 
// Prevent model overwrite errors
const College =
  mongoose.models.College ||
  mongoose.model("College", collegeSchema);

export default College;
