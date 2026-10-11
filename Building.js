
import mongoose from "mongoose";

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: true,
    },

    floor: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate model compilation
const Building =
  mongoose.models.Building ||
  mongoose.model("Building", buildingSchema);

export default Building;
