import express from "express";
import { getFacultyQueue, getFacultyStudents } from "../controllers/facultyController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("faculty"));
router.get("/students", getFacultyStudents);
router.get("/queue", getFacultyQueue);

export default router;
