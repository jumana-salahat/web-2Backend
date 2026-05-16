/**
 * Validates the submission request body before reaching the controller.
 *
 * Validation depends on selected add-ons:
 * - meal add-on requires goal and calories
 * - workout add-on requires fitnessLevel and workoutDays
 *
 * This keeps invalid data away from business logic and database.
 */
import { ApiError } from "./errorHandler.js";

const allowedMainGoals = [
  "lose_weight",
  "gain_muscle",
  "stay_fit",
  "healthy_habits",
];

const allowedAddons = [
  "workout",
  "meal",
  "tracking",
  "macros",
  "support",
  "guidance",
];

const allowedFitnessLevels = ["Beginner", "Intermediate", "Advanced"];

/**
 * Middleware to validate submission request body
 * Validates the submitted plan based on selected use cases and add-ons
 */
export const validateSubmission = (req, _res, next) => {
  const {
    offerId,
    mainGoal,
    selectedAddons,
    goal,
    calories,
    fitnessLevel,
    workoutDays,
  } = req.body;

  /**
   * Validate selected offer
   */
  if (typeof offerId !== "number" || offerId < 1 || offerId > 3) {
    throw new ApiError("offerId must be a number between 1 and 3", 400);
  }

  /**
   * Validate main goal selected from frontend
   */
  if (typeof mainGoal !== "string" || !allowedMainGoals.includes(mainGoal)) {
    throw new ApiError(
      "mainGoal must be one of: lose_weight, gain_muscle, stay_fit, healthy_habits",
      400
    );
  }

  /**
   * Validate selected add-ons
   */
  if (!Array.isArray(selectedAddons) || selectedAddons.length === 0) {
    throw new ApiError("selectedAddons must be a non-empty array", 400);
  }

  const hasInvalidAddon = selectedAddons.some(
    (addon) => typeof addon !== "string" || !allowedAddons.includes(addon)
  );

  if (hasInvalidAddon) {
    throw new ApiError("selectedAddons contains invalid values", 400);
  }

  const hasMealPlan = selectedAddons.includes("meal");
  const hasWorkoutPlan = selectedAddons.includes("workout");

  /**
   * If user selected meal plan, diet preferences are required
   */
  if (hasMealPlan) {
    if (typeof goal !== "string" || goal.trim().length < 2) {
      throw new ApiError("goal is required when meal plan is selected", 400);
    }

    if (typeof calories !== "number" || calories < 500 || calories > 5000) {
      throw new ApiError(
        "calories must be a number between 500 and 5000",
        400
      );
    }
  }

  /**
   * If user selected workout plan, training preferences are required
   */
  if (hasWorkoutPlan) {
    if (
      typeof fitnessLevel !== "string" ||
      !allowedFitnessLevels.includes(fitnessLevel)
    ) {
      throw new ApiError(
        "fitnessLevel must be one of: Beginner, Intermediate, Advanced",
        400
      );
    }

    if (
      typeof workoutDays !== "number" ||
      workoutDays < 2 ||
      workoutDays > 6
    ) {
      throw new ApiError(
        "workoutDays must be a number between 2 and 6",
        400
      );
    }
  }

  /**
   * Continue to controller after all validation checks pass
   */
  next();
};