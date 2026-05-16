import { Router } from "express";
import {
  register,
  login,
  googleAuth,
} from "../controllers/authController.js";

import verifyFirebaseToken from "../middleware/verifyToken.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */

router.post("/register", register);

router.post("/login", login);

router.post("/google", verifyFirebaseToken, googleAuth);

export default router;