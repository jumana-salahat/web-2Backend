import { Router } from "express";
import { getHomeData } from "../controllers/homeController.js";

const router = Router();

router.get("/", getHomeData);

export default router;
