import mongoose from "mongoose";
import Offer from "../models/Offer.js";
import { ApiError } from "../middleware/errorHandler.js";

/**
 * @route   GET /api/offers
 * @access  Public
 *
 * Returns all active offers to the frontend.
 * Only offers where isActive === true are included,
 * so the admin can deactivate an offer from the dashboard
 * without it appearing on the public page.
 *
 * Results are sorted by the numeric id field (1, 2, 3)
 * to guarantee consistent card order regardless of insertion order.
 */
export const getActiveOffers = async (_req, res, next) => {
  try {
    const offers = await Offer.find({ isActive: true })
      .sort({ id: 1 })
      .select("-updatedBy -__v");

    return res.status(200).json({
      success: true,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/offers
 * @access  Admin only
 *
 * Returns all offers including inactive ones.
 * Used by the admin dashboard to show the full list
 * with the ability to toggle, edit, or deactivate any offer.
 *
 * Includes updatedBy field so the dashboard can show
 * which admin last modified each offer.
 */
export const getAllOffersAdmin = async (_req, res, next) => {
  try {
    const offers = await Offer.find()
      .sort({ id: 1 })
      .populate("updatedBy", "name email")
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/admin/offers/:id
 * @access  Admin only
 *
 * Updates a single offer by its numeric id (1, 2, or 3).
 * The admin can change price, title, badge, discount label,
 * features list, or toggle isActive on or off.
 *
 * updatedBy is set automatically from the authenticated admin's userId
 * so every change is traceable to a specific account.
 *
 * Rejects updates to the numeric id field to prevent
 * breaking the link between offers and existing submissions.
 */
export const updateOffer = async (req, res, next) => {
  try {
    const offerId = Number(req.params.id);

    if (isNaN(offerId)) {
      throw new ApiError("Offer id must be a number", 400);
    }

    /**
     * @guard id change
     * Changing the numeric id would break all existing submissions
     * that reference this offer by that id, so it is explicitly blocked.
     */
    if (req.body.id !== undefined) {
      throw new ApiError("Offer id cannot be changed", 400);
    }

    const offer = await Offer.findOneAndUpdate(
      { id: offerId },
      {
        $set: {
          ...req.body,
          updatedBy: req.user?.userId,
        },
      },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!offer) {
      throw new ApiError("Offer not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/offers
 * @access  Admin only
 *
 * Creates a new offer.
 * The numeric id must be unique and greater than 0.
 * updatedBy is set to the authenticated admin on creation.
 */
export const createOffer = async (req, res, next) => {
  try {
    const existing = await Offer.findOne({ id: req.body.id });

    if (existing) {
      throw new ApiError(`An offer with id ${req.body.id} already exists`, 409);
    }

    const offer = await Offer.create({
      ...req.body,
      updatedBy: req.user?.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Offer created successfully",
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/offers/:id/toggle
 * @access  Admin only
 *
 * Toggles the isActive field of an offer between true and false.
 * Separated from the full update route so the dashboard
 * can use a simple toggle switch without sending the full offer body.
 */
export const toggleOfferActive = async (req, res, next) => {
  try {
    const offerId = Number(req.params.id);

    if (isNaN(offerId)) {
      throw new ApiError("Offer id must be a number", 400);
    }

    const offer = await Offer.findOne({ id: offerId });

    if (!offer) {
      throw new ApiError("Offer not found", 404);
    }

    offer.isActive = !offer.isActive;
    offer.updatedBy = req.user?.userId
      ? new mongoose.Types.ObjectId(req.user.userId)
      : undefined;

    await offer.save();

    return res.status(200).json({
      success: true,
      message: `Offer ${offer.isActive ? "activated" : "deactivated"} successfully`,
      data: {
        id: offer.id,
        isActive: offer.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};