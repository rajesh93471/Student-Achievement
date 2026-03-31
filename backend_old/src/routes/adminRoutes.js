import express from "express";
import {
  bulkCreateStudents,
  bulkUpdateStudents,
  createStudent,
  deleteStudent,
  exportReport,
  getAnalyticsInsights,
  getDashboard,
  getMeta,
  getReports,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { idSchema } from "../utils/schemas.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/dashboard", getDashboard);
router.get("/insights", getAnalyticsInsights);
router.get("/reports", getReports);
router.get("/reports/export", exportReport);
router.get("/meta", getMeta);
router.post("/students", createStudent);
router.post("/students/bulk", bulkCreateStudents);
router.put("/students/bulk", bulkUpdateStudents);
router.delete("/students/:id", validate(idSchema), deleteStudent);

export default router;
