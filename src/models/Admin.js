import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    stats: [
        {
            title: String,
            value: String,
            trend: String,
            icon: String
        }
    ],

    analytics: [
        {
            name: String,
            value: Number
        }
    ],

    users: [
        {
            name: String,
            email: String,
            role: String,
            status: String
        }
    ],

    orders: [
        {
            id: String,
            customer: String,
            type: String,
            status: String,
            amount: String
        }
    ],

    activities: [String]
});

export default mongoose.model("Admin", adminSchema);