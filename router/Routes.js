import { Router } from "express";

import {
  registerUserPost,
  signinUserPost,
  createCompanyPost,
  fetchCompanyPost,
  fetchCompanyMessagesPost,
  addCompany,
  readMailPost,
} from "../controller/Controller.js";

const router = Router();

router.post("/register", registerUserPost);
router.post("/signin", signinUserPost);
router.post("/company/register", createCompanyPost);
router.post("/companyFetch", fetchCompanyPost);
router.post("/companyMessagesFetch", fetchCompanyMessagesPost);
router.post("/addCompany", addCompany);
router.post("/readMailPost", readMailPost);

export default router;
