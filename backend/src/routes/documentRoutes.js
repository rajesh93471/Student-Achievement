import express from "express";
import {
  createDocumentUpload,
  deleteDocument,
  getDocumentDownloadUrl,
  listDocuments,
  saveDocument,
} from "../controllers/documentController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { documentSchema, idSchema } from "../utils/schemas.js";

const router = express.Router();

router.use(protect);
router.post("/upload-url", authorize("student"), createDocumentUpload);
router.get("/", authorize("student"), listDocuments);
router.post("/", authorize("student"), validate(documentSchema), saveDocument);
router.get("/:id/download-url", authorize("student", "admin", "parent"), validate(idSchema), getDocumentDownloadUrl);
router.delete("/:id", authorize("student", "admin"), validate(idSchema), deleteDocument);

export default router;
