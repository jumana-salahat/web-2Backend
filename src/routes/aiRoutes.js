import { Router } from "express";
import { askAI } from "../controllers/aiController.js";

const router = Router();

router.post("/ask", askAI);

export default router;