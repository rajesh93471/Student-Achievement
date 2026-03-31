import express from "express";
import {
  adminUpdateStudent,
  getMyProfile,
  getStudentById,
  listStudents,
  updateMyProfile,
} from "../controllers/studentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { idSchema, profileUpdateSchema } from "../utils/schemas.js";

const router = express.Router();

router.use(protect);
router.get("/me", authorize("student"), getMyProfile);
router.get("/", authorize("admin", "faculty"), listStudents);
router.get("/:id", validate(idSchema), authorize("admin", "faculty", "student"), getStudentById);
router.put("/:id", validate(idSchema), authorize("admin"), adminUpdateStudent);

export default router;
