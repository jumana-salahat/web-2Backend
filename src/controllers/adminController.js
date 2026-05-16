import Admin from "../models/Admin.js";

export const getAdminDashboard =  async (req, res) => {
    const data = await Admin.findOne();

    res.json(data);
};