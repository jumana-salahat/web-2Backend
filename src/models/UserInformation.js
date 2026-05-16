import mongoose from "mongoose";

const userInformationSchema = new mongoose.Schema(
  {
    age: {
      type: Number,
      required: true,
      min: 1,
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
    },
    height: {
      type: Number,
      required: true,
      min: 1,
    },
    gender: {
      type: String,
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserInformation", userInformationSchema);