import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { changePasswordSchema, userSettingsSchema } from "../utils/schemas.js";
import { changeMyPassword, getMySettings, updateMySettings } from "../controllers/userController.js";

const router = express.Router();

router.use(protect);
router.get("/me/settings", getMySettings);
router.put("/me/settings", validate(userSettingsSchema), updateMySettings);
router.post("/me/change-password", validate(changePasswordSchema), changeMyPassword);

export default router;
