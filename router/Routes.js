import { Router } from "express";

import { createUserPost, signinUserPost } from "../controller/Controller.js";

const router = Router();

router.post("/register", createUserPost);
router.post("/signin", signinUserPost);

export default router;
