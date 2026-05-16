import { Router } from "express";
import {
  getActiveOffers,
  getAllOffersAdmin,
  updateOffer,
  createOffer,
  toggleOfferActive,
} from "../controllers/offersController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Offers
 *   description: Fitness plan offers
 */

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Get all active offers
 *     tags: [Offers]
 *     description: >
 *       Public endpoint. Returns only offers where isActive is true,
 *       sorted by id. Used by the frontend to render the pricing cards.
 *     responses:
 *       200:
 *         description: List of active offers
 */
router.get("/", getActiveOffers);

/**
 * @swagger
 * /api/admin/offers:
 *   get:
 *     summary: Get all offers including inactive (admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full offers list with updatedBy populated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 */
router.get("/admin", protect, adminOnly, getAllOffersAdmin);

/**
 * @swagger
 * /api/admin/offers:
 *   post:
 *     summary: Create a new offer (admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Offer created successfully
 *       409:
 *         description: Offer with this id already exists
 */
router.post("/admin", protect, adminOnly, createOffer);

/**
 * @swagger
 * /api/admin/offers/{id}:
 *   put:
 *     summary: Update an offer by numeric id (admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric offer id (1, 2, or 3)
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *       400:
 *         description: Invalid id or attempt to change offer id
 *       404:
 *         description: Offer not found
 */
router.put("/admin/:id", protect, adminOnly, updateOffer);

/**
 * @swagger
 * /api/admin/offers/{id}/toggle:
 *   patch:
 *     summary: Toggle offer active status (admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Offer activated or deactivated
 *       404:
 *         description: Offer not found
 */
router.patch("/admin/:id/toggle", protect, adminOnly, toggleOfferActive);

export default router;