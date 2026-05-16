import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { sendCancellationEmail } from "../utils/mailer.js";

const planNames = {
  1: "Basic Plan",
  2: "Pro Plan",
  3: "Elite Plan",
};

/**
 * Checks for expired subscriptions daily.
 * Updates status to "expired" and sends cancellation email to the user.
 */
export const checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();

    const expiredSubmissions = await Submission.find({
      status: "active",
      expiresAt: { $lte: now },
    });

    for (const submission of expiredSubmissions) {
      submission.status = "expired";
      await submission.save();

      const user = await User.findById(submission.userId);
      if (user) {
        const planName = planNames[submission.offerId] ?? "Selected Plan";
        await sendCancellationEmail(user.email, user.name, planName);
      }
    }

    console.log(`Checked ${expiredSubmissions.length} expired subscriptions`);
  } catch (error) {
    console.error("Error checking expired subscriptions:", error);
  }
};