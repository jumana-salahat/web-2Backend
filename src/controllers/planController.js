import FitnessPlan from "../models/FitnessPlan.js";
import { ApiError } from "../middleware/errorHandler.js";

export const createPlan = async (req, res, next) => {
  try {
    const { goal, workoutDays, nutritionNotes } = req.body;

    if (!goal || !workoutDays) {
      throw new ApiError("Goal and workout days are required", 400);
    }

    // Generate simple workout plan
    let workoutPlan = [];

const muscleGainPlan = [
  "Chest & Triceps",
  "Back & Biceps",
  "Leg day",
  "Shoulders workout",
  "Arms workout",
  "Cardio session",
  "Full body workout",
];

const weightLossPlan = [
  "30 min cardio",
  "HIIT workout",
  "Core exercises",
  "Fat burn training",
  "Walking",
  "Cycling",
  "Jump rope",
];

const fitnessPlan = [
  "Walking",
  "Stretching",
  "Light cardio",
  "Bodyweight exercises",
  "Yoga",
  "Mobility training",
  "Recovery workout",
];

if (goal === "Muscle Gain") {
  workoutPlan = muscleGainPlan.slice(0, workoutDays);
} else if (goal === "Weight Loss") {
  workoutPlan = weightLossPlan.slice(0, workoutDays);
} else {
  workoutPlan = fitnessPlan.slice(0, workoutDays);
}
    const plan = await FitnessPlan.create({
      user: req.user.userId,
      goal,
      workoutDays,
      nutritionNotes,
    });

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: {
        ...plan.toObject(),
        workoutPlan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPlans = async (req, res, next) => {
    try {
        const plans = await FitnessPlan.find({
            user: req.user.userId,
        }).populate("user", "name email");

        return res.status(200).json({
            success: true,
            count: plans.length,
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};