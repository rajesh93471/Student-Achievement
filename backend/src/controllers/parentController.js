import ParentProfile from "../models/ParentProfile.js";
import Achievement from "../models/Achievement.js";
import Document from "../models/Document.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getParentDashboard = asyncHandler(async (req, res) => {
  const parent = await ParentProfile.findOne({ user: req.user._id });
  if (!parent) {
    res.status(404);
    throw new Error("Parent profile not found");
  }

  const [student, achievements, documents] = await Promise.all([
    Student.findById(parent.student),
    Achievement.find({ student: parent.student }).sort({ date: -1 }),
    Document.find({ student: parent.student }).sort({ createdAt: -1 }),
  ]);

  res.json({
    parent,
    student,
    achievements,
    documents,
  });
});
