import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cardHolder: {
      type: String,
      required: true,
    },

    cardLast4: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);