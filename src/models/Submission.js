import mongoose, { Schema } from "mongoose";

const submissionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    offerId: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },

    mainGoal: {
      type: String,
      required: true,
      enum: ["lose_weight", "gain_muscle", "stay_fit", "healthy_habits"],
    },

    selectedAddons: {
      type: [String],
      required: true,
      enum: ["workout", "meal", "tracking", "macros", "support", "guidance"],
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one add-on must be selected",
      },
    },

    goal: {
      type: String,
      trim: true,
    },

    calories: {
      type: Number,
      min: 500,
      max: 5000,
    },

    fitnessLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
    },

    workoutDays: {
      type: Number,
      min: 2,
      max: 6,
    },

    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Submission", submissionSchema);