import { Router } from "express";
import {
  register,
  login,
  googleAuth,
} from "../controllers/authController.js";

import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/google", verifyToken, googleAuth);

export default router;