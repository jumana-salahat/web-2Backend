import express from "express";
import {
  createUserInformation,
  getUserInformation,
} from "../controllers/UserInformationController.js";

const router = express.Router();

router.post("/", createUserInformation);
router.get("/", getUserInformation);

export default router;