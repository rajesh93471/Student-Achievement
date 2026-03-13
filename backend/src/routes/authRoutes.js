import express from "express";
import { login, me, registerParent, registerStudent } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerParentSchema, registerStudentSchema } from "../utils/schemas.js";

const router = express.Router();

router.post("/register/student", validate(registerStudentSchema), registerStudent);
router.post("/register/parent", validate(registerParentSchema), registerParent);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, me);

export default router;
