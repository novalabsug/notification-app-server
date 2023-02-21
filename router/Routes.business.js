import { Router } from "express";
import {
  createApikeyPost,
  fetchApiKeys,
  fetchProfilePost,
  registerPost,
  signinPost,
} from "../controller/Contoller.business.js";
import { verifyToken } from "../middleware/middleware.js";

const router = Router();

router.post("/register", registerPost);
router.post("/signin", signinPost);
router.post("/profile", verifyToken, fetchProfilePost);
router.post("/apikeys", verifyToken, fetchApiKeys);
router.post("/new/apikeys", verifyToken, createApikeyPost);

export default router;
