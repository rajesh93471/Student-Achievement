import Document from "../models/Document.js";
import ParentProfile from "../models/ParentProfile.js";
import Student from "../models/Student.js";
import { createDownloadUrl, createUploadUrl } from "../config/s3.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

export const createDocumentUpload = asyncHandler(async (req, res) => {
  const { fileName, contentType } = req.body;
  if (!fileName || !contentType || !allowedMimeTypes.includes(contentType)) {
    return res.status(400).json({ message: "Unsupported file type" });
  }
  const key = `students/${req.user._id}/${Date.now()}-${fileName}`;
  const payload = await createUploadUrl({ key, contentType });
  res.json(payload);
});

export const listDocuments = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  const documents = await Document.find({ student: student._id }).sort({ createdAt: -1 });
  res.json({ documents });
});

export const saveDocument = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }
  const document = await Document.create({
    student: student._id,
    ...req.validated.body,
  });
  student.documentsCount += 1;
  await student.save();
  res.status(201).json({ document });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id).populate("student");
  if (!document) {
    res.status(404);
    throw new Error("Document not found");
  }
  if (req.user.role === "student" && String(document.student.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  await document.deleteOne();
  await Student.findByIdAndUpdate(document.student._id, { $inc: { documentsCount: -1 } });
  res.json({ message: "Document deleted" });
});

export const getDocumentDownloadUrl = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id).populate("student");
  if (!document) {
    res.status(404);
    throw new Error("Document not found");
  }
  if (req.user.role === "student" && String(document.student.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (req.user.role === "parent") {
    const parent = await ParentProfile.findOne({ user: req.user._id });
    if (!parent || String(parent.student) !== String(document.student._id)) {
      return res.status(403).json({ message: "Forbidden" });
    }
  }

  const payload = await createDownloadUrl({ key: document.fileKey });
  res.json({ downloadUrl: payload.downloadUrl, mock: payload.mock });
});
