
import mongoose from "mongoose";

const hallSchema = new mongoose.Schema(
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

    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      required: true,
    },

    floor: {
      type: Number,
      required: true,
      min: 0,
    },

    rows: {
      type: Number,
      required: true,
      min: 1,
    },

    columns: {
      type: Number,
      required: true,
      min: 1,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  }
);

const Hall =
  mongoose.models.Hall ||
  mongoose.model("Hall", hallSchema);

export default Hall;
