import mongoose from "mongoose";

const dashboardSchema = new mongoose.Schema({
    name: String,

    weeklyProgress: [
        {
            day: String,
            burnt: Number,
            target: Number
        }
    ],

    stats: [
        {
            title: String,
            value: Number
        }
    ],

    categories: [
        {
            name: String,
            value: Number
        }
    ],

    sleep: [
        {
            name: String,
            value: Number
        }
    ],

    nutrition: {
        protein: Number,
        carbs: Number,
        fat: Number
    },

    water: {
        consumed: Number,
        goal: Number
    }
});

export default mongoose.model("Dashboard", dashboardSchema);