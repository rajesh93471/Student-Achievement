import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { chatWithBot } from "../controllers/chatbotController.js";

const router = express.Router();

const chatbotSchema = z.object({
  body: z.object({
    message: z.string().min(2),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

router.use(protect);
router.post("/", validate(chatbotSchema), chatWithBot);

export default router;
