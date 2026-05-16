import Submission from "../models/Submission.js";
import Offer from "../models/Offer.js";
import User from "../models/User.js";
import { sendSubscriptionEmail } from "../utils/mailer.js";
import { ApiError } from "../middleware/errorHandler.js";

/**
 * @map planNames
 * Maps numeric offerId to a human-readable plan name.
 * Used in confirmation and cancellation emails.
 * Must stay in sync with the offer ids in the database.
 */
const planNames = {
  1: "Training Only",
  2: "Diet Plan Only",
  3: "Both Together",
};

/**
 * @route   POST /api/submissions
 * @access  Protected (user)
 *
 * Creates a new fitness plan submission for the authenticated user.
 * Steps:
 *   1. Request body is already validated by validateSubmission middleware.
 *   2. Checks that the user has no existing active subscription.
 *   3. Saves the submission with userId from the JWT (never from the body).
 *   4. Sets status to active and expiresAt to 30 days from now.
 *   5. Sends a confirmation email to the user.
 *
 * @security userId is taken from req.user (JWT payload), not req.body.
 * This prevents a user from submitting on behalf of another user.
 */
export const createSubmission = async (req, res, next) => {
  try {
    /**
     * @check active subscription
     * A user can only have one active subscription at a time.
     * If they already have one, reject the request with a clear message.
     */
    const existing = await Submission.findOne({
      userId: req.user?.userId,
      status: "active",
    });

    if (existing) {
  existing.status = "cancelled";
  existing.cancelledAt = new Date();
  await existing.save();
}

    const submission = await Submission.create({
      ...req.body,
      userId: req.user?.userId,
      status: "active",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    const user = await User.findById(req.user?.userId);

    if (user) {
      const planName = planNames[req.body.offerId] ?? "Selected Plan";
      await sendSubscriptionEmail(user.email, user.name, planName);
    }

    return res.status(201).json({
      success: true,
      message: "Submission created successfully",
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/submissions/me
 * @access  Protected (user)
 *
 * Returns all submissions that belong to the authenticated user only.
 * userId is taken from the JWT — a user cannot access another user's data
 * by changing any parameter in the request.
 *
 * Populates offer details from the Offer collection so the frontend
 * can display the plan title and price without a second request.
 */
export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      userId: req.user?.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    /**
     * @populate offer details
     * Attaches the matching Offer document to each submission
     * so the frontend gets title, price, and features in one response.
     */
    const offerIds = [...new Set(submissions.map((s) => s.offerId))];
    const offers = await Offer.find({ id: { $in: offerIds } })
      .select("id title price badge discount")
      .lean();

    const offersMap = Object.fromEntries(offers.map((o) => [o.id, o]));

    const data = submissions.map((submission) => ({
      ...submission,
      offer: offersMap[submission.offerId] ?? null,
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/submissions
 * @access  Admin only
 *
 * Returns all submissions in the database sorted by newest first.
 * Populates the userId field with the user's name and email
 * so the admin dashboard can display who made each submission.
 */
export const getAllSubmissions = async (_req, res, next) => {
  try {
    const submissions = await Submission.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/submissions/stats
 * @access  Admin only
 *
 * Returns aggregated statistics for the admin dashboard:
 *   - Total submissions count
 *   - Count per status (active, expired, cancelled)
 *   - Count per offerId (which plan is most popular)
 *   - Count per mainGoal
 *   - Total active subscriptions revenue (active count × plan price)
 */
export const getSubmissionStats = async (_req, res, next) => {
  try {
    const [statusStats, offerStats, goalStats, offers] = await Promise.all([
      Submission.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Submission.aggregate([
        { $group: { _id: "$offerId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Submission.aggregate([
        { $group: { _id: "$mainGoal", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Offer.find({ isActive: true }).select("id price title").lean(),
    ]);

    /**
     * @calculate revenue
     * Estimates monthly revenue by multiplying each active plan's
     * subscriber count by its current price.
     * This is an estimate — does not account for billing cycles.
     */
    const offerPriceMap = Object.fromEntries(
      offers.map((o) => [o.id, o.price])
    );

    const revenue = offerStats.reduce((total, stat) => {
      const price = offerPriceMap[stat._id] ?? 0;
      const activeForOffer =
        statusStats.find((s) => s._id === "active")?.count ?? 0;
      return total + price * activeForOffer;
    }, 0);

    const totalSubmissions = await Submission.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        total: totalSubmissions,
        byStatus: statusStats,
        byOffer: offerStats,
        byGoal: goalStats,
        estimatedMonthlyRevenue: revenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/submissions/:id/cancel
 * @access  Protected (user)
 *
 * Allows the authenticated user to cancel their own active subscription.
 * Verifies that the submission belongs to the requesting user
 * before changing the status to cancelled.
 *
 * @security userId from JWT is compared against submission.userId
 * so a user cannot cancel another user's subscription.
 */
export const cancelSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id);

    if (!submission) {
      throw new ApiError("Submission not found", 404);
    }

    /**
     * @guard ownership
     * Compares the submission's userId with the authenticated user's id.
     * Rejects the request if they do not match.
     */
    if (submission.userId.toString() !== req.user?.userId) {
      throw new ApiError("Access denied", 403);
    }

    if (submission.status !== "active") {
      throw new ApiError(`Submission is already ${submission.status}`, 400);
    }

    submission.status = "cancelled";
    await submission.save();

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: {
        id: submission._id,
        status: submission.status,
      },
    });
  } catch (error) {
    next(error);
  }
};