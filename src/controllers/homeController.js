import User from "../models/User.js";
import Submission from "../models/Submission.js";
import Offer from "../models/Offer.js";

export const getHomeData = async (req, res) => {
  try {
    const users = await User.countDocuments();

    const submissions = await Submission.countDocuments();

    const offers = await Offer.find({
      isActive: true,
    });

    res.status(200).json({
      success: true,

      stats: {
        users,
        submissions,
        successRate: "95%",
        rating: "4.9",
      },

      offers,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load home data",
    });
  }
};