import Dashboard from "../models/Dashboard.js";

export const getDashboard = async (req, res) => {
    const data = await Dashboard.findOne();

    res.json(data);
};