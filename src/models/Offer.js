import mongoose, { Schema } from "mongoose";

const offerFeatureSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    included: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false }
);

const offerSchema = new Schema(
  {
    /**
     * @field id
     * Numeric identifier that matches the offerId used in the frontend and Submission model.
     * Kept as a plain number (1, 2, 3) so the frontend does not need to change.
     * Must be unique across all offers.
     */
    id: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },

    tag: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * @field price
     * Monthly price in USD.
     * Admin can update this from the dashboard.
     * Change is reflected immediately on the frontend because
     * the frontend fetches offers from GET /api/offers on load.
     */
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * @field badge
     * Optional label shown on the card (e.g. "Best Value").
     * Admin can add, change, or remove it from the dashboard.
     */
    badge: {
      type: String,
      trim: true,
    },

    /**
     * @field discount
     * Renamed from "save" to avoid conflict with Mongoose's built-in
     * Document.save() method.
     * Stores the discount label shown below the price (e.g. "Save 20%").
     */
    discount: {
      type: String,
      trim: true,
    },

    features: {
      type: [offerFeatureSchema],
      required: true,
    },

    /**
     * @field showDiet
     * Controls whether the diet preferences step is shown to the user
     * during the signup flow when this offer is selected.
     */
    showDiet: {
      type: Boolean,
      required: true,
    },

    /**
     * @field showTraining
     * Controls whether the training preferences step is shown to the user
     * during the signup flow when this offer is selected.
     */
    showTraining: {
      type: Boolean,
      required: true,
    },

    /**
     * @field isActive
     * When false, the offer is hidden from the public GET /api/offers response.
     * Admin can deactivate an offer without deleting it or its related submissions.
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * @field updatedBy
     * References the admin user who last modified this offer.
     * Stored for audit purposes so changes can be traced back to a specific account.
     */
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Offer", offerSchema);