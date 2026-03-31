import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { notificationSchema } from "../utils/schemas.js";
import {
  createNotification,
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(protect);
router.post("/", authorize("student"), validate(notificationSchema), createNotification);
router.get("/", authorize("admin"), getNotifications);
router.put("/:id/read", authorize("admin"), markNotificationRead);
router.delete("/:id", authorize("admin"), deleteNotification);

export default router;
