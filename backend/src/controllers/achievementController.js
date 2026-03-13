import Achievement from "../models/Achievement.js";
import Student from "../models/Student.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getScopedStudent = async (user) => {
  if (user.role !== "student") {
    return null;
  }
  return Student.findOne({ user: user._id });
};

export const listAchievements = asyncHandler(async (req, res) => {
  const query = {};
  if (req.user.role === "student") {
    const student = await getScopedStudent(req.user);
    query.student = student._id;
  }
  if (req.user.role === "faculty") {
    const students = await Student.find({ department: req.user.department }).select("_id");
    query.student = { $in: students.map((student) => student._id) };
  }
  if (req.query.category) {
    query.category = req.query.category;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }
  const achievements = await Achievement.find(query).populate("student", "fullName studentId department");
  res.json({ achievements });
});

export const createAchievement = asyncHandler(async (req, res) => {
  const student = await getScopedStudent(req.user);
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }
  const achievement = await Achievement.create({
    student: student._id,
    ...req.validated.body,
  });
  student.achievementsCount += 1;
  await student.save();
  res.status(201).json({ achievement });
});

export const updateAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id).populate("student");
  if (!achievement) {
    res.status(404);
    throw new Error("Achievement not found");
  }
  if (req.user.role === "student" && String(achievement.student.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  Object.assign(achievement, req.body, { status: "pending" });
  await achievement.save();
  res.json({ achievement });
});

export const deleteAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id).populate("student");
  if (!achievement) {
    res.status(404);
    throw new Error("Achievement not found");
  }
  if (req.user.role === "student" && String(achievement.student.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  await achievement.deleteOne();
  await Student.findByIdAndUpdate(achievement.student._id, { $inc: { achievementsCount: -1 } });
  res.json({ message: "Achievement deleted" });
});

export const reviewAchievement = asyncHandler(async (req, res) => {
  const achievement = await Achievement.findById(req.params.id);
  if (!achievement) {
    res.status(404);
    throw new Error("Achievement not found");
  }
  achievement.status = req.validated.body.status;
  achievement.feedback = req.validated.body.feedback;
  achievement.recommendedForAward = req.validated.body.recommendedForAward || false;
  achievement.verifiedBy = req.user._id;
  await achievement.save();
  res.json({ achievement });
});
