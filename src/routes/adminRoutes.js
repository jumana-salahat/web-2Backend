import { Router } from "express";

const router = Router();

import { protect, adminOnly } from "../middleware/auth.js";

import { getAdminDashboard } from "../controllers/adminController.js";

router.get("/", protect, adminOnly, getAdminDashboard);

export default router;