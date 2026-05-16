import { Router } from "express";
import { createPlan, getPlans } from "../controllers/planController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, createPlan);
router.get("/", protect, getPlans);

export default router;