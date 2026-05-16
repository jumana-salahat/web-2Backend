import { Router } from "express";
import {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  getSubmissionStats,
  cancelSubmission,
} from "../controllers/submissionsController.js";
import { validateSubmission } from "../middleware/validateSubmission.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Fitness plan submissions
 */

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Create a new submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Creates a new fitness plan submission for the authenticated user.
 *       Rejects the request if the user already has an active subscription.
 *       userId is taken from the JWT — never from the request body.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [offerId, mainGoal, selectedAddons]
 *             properties:
 *               offerId:
 *                 type: integer
 *                 example: 2
 *               mainGoal:
 *                 type: string
 *                 enum: [lose_weight, gain_muscle, stay_fit, healthy_habits]
 *               selectedAddons:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [workout, meal, tracking, macros, support, guidance]
 *               goal:
 *                 type: string
 *               calories:
 *                 type: integer
 *               fitnessLevel:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced]
 *               workoutDays:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Submission created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: User already has an active subscription
 */
router.post("/", protect, validateSubmission, createSubmission);

/**
 * @swagger
 * /api/submissions/me:
 *   get:
 *     summary: Get current user's submissions
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Returns all submissions that belong to the authenticated user.
 *       Each submission includes the matching offer details (title, price).
 *       A user cannot access another user's submissions.
 *     responses:
 *       200:
 *         description: List of user's submissions with offer details
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protect, getMySubmissions);

/**
 * @swagger
 * /api/submissions/stats:
 *   get:
 *     summary: Get submission statistics (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Returns aggregated stats for the admin dashboard:
 *       total count, breakdown by status, by offer, by goal,
 *       and estimated monthly revenue.
 *     responses:
 *       200:
 *         description: Submission statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/stats", protect, adminOnly, getSubmissionStats);

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Get all submissions (admin)
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Returns all submissions in the database sorted by newest first.
 *       Each submission includes the user's name and email.
 *     responses:
 *       200:
 *         description: Full submissions list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/", protect, adminOnly, getAllSubmissions);

/**
 * @swagger
 * /api/submissions/{id}/cancel:
 *   patch:
 *     summary: Cancel an active subscription
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Allows the authenticated user to cancel their own active subscription.
 *       Verifies ownership before changing the status to cancelled.
 *       A user cannot cancel another user's subscription.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB submission _id
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       400:
 *         description: Subscription is already expired or cancelled
 *       403:
 *         description: Access denied
 *       404:
 *         description: Submission not found
 */
router.patch("/:id/cancel", protect, cancelSubmission);

export default router;