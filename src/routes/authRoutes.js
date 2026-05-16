import { Router } from "express";
import {
  register,
  login,
  googleAuth,
} from "../controllers/authController.js";

import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.post("/register", register); //when user do register

router.post("/login", login);//when user do login

router.post("/google", verifyToken, googleAuth); //when user do google auth, the FE will send the token to BE,
                                                 //  then BE will verify the token and get the user data from the token,

export default router;