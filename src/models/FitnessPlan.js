import mongoose, { Schema } from "mongoose";

const fitnessPlanSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        goal: {
            type: String,
            required: true,
            trim: true,
        },

        workoutDays: {
            type: Number,
            required: true,
            min: 1,
            max: 7,
        },

        nutritionNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("FitnessPlan", fitnessPlanSchema);