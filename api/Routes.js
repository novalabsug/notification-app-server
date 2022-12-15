import { Router } from "express";

import { createUserPost, mailDeliveryPost } from "../controller/Controller.js";
import { verifyApiKey } from "../middleware/middleware.js";

const router = Router();

router.get("/register", verifyApiKey, createUserPost);
router.post("/mail_send", mailDeliveryPost);

export default router;
