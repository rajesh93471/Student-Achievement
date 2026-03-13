import Achievement from "../models/Achievement.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFacultyStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ department: req.user.department }).sort({ fullName: 1 });
  res.json({ students });
});

export const getFacultyQueue = asyncHandler(async (req, res) => {
  const students = await Student.find({ department: req.user.department }).select("_id");
  const achievements = await Achievement.find({
    student: { $in: students.map((student) => student._id) },
    status: "pending",
  }).populate("student", "fullName studentId");
  res.json({ achievements });
});
