import express from "express";
import {
  createAchievement,
  deleteAchievement,
  listAchievements,
  reviewAchievement,
  updateAchievement,
} from "../controllers/achievementController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { achievementReviewSchema, achievementSchema, idSchema } from "../utils/schemas.js";

const router = express.Router();

router.use(protect);
router.get("/", authorize("student", "admin", "faculty"), listAchievements);
router.post("/", authorize("student"), validate(achievementSchema), createAchievement);
router.put("/:id", authorize("student"), validate(idSchema), updateAchievement);
router.delete("/:id", authorize("student", "admin"), validate(idSchema), deleteAchievement);
router.patch("/:id/review", authorize("admin", "faculty"), validate(achievementReviewSchema), reviewAchievement);

export default router;
