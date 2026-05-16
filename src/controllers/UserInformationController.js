import UserInformation from "../models/UserInformation.js";

// Create new user information
export const createUserInformation = async (req, res) => {
  try {
    const { age, weight, height, gender, goal, days } = req.body;

    // Validation
    if (!age || !weight || !height || !gender || !goal || !days) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (age <= 0 || weight <= 0 || height <= 0 || days <= 0) {
      return res.status(400).json({
        message: "Age, weight, height, and days must be positive numbers",
      });
    }

    const info = await UserInformation.create({
      age,
      weight,
      height,
      gender,
      goal,
      days,
    });

    res.status(201).json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all user information records
export const getUserInformation = async (req, res) => {
  try {
    const info = await UserInformation.find();
    res.status(200).json(info);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};