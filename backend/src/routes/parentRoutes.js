import express from "express";
import { getParentDashboard } from "../controllers/parentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("parent"));
router.get("/me", getParentDashboard);

export default router;
