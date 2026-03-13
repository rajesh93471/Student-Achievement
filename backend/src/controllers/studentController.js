import Student from "../models/Student.js";
import Achievement from "../models/Achievement.js";
import Document from "../models/Document.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const buildStudentQuery = (req) => {
  if (req.user.role === "student") {
    return { user: req.user._id };
  }

  if (req.user.role === "faculty") {
    return { department: req.user.department };
  }

  return {};
};

export const getMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  const [achievements, documents] = await Promise.all([
    Achievement.find({ student: student._id }).sort({ date: -1 }),
    Document.find({ student: student._id }).sort({ createdAt: -1 }),
  ]);

  res.json({ student, achievements, documents });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error("Student profile not found");
  }

  Object.assign(student, req.validated.body);
  await student.save();

  res.json({ student });
});

export const listStudents = asyncHandler(async (req, res) => {
  const { search, department, semester, year, category } = req.query;
  const match = { ...buildStudentQuery(req) };

  if (department) {
    match.department = department;
  }
  if (semester) {
    match.semester = Number(semester);
  }
  if (year) {
    match.year = Number(year);
  }
  if (search) {
    match.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { studentId: { $regex: search, $options: "i" } },
      { department: { $regex: search, $options: "i" } },
    ];
  }

  let students = await Student.find(match).sort({ createdAt: -1 }).lean();

  if (category) {
    const achievementStudentIds = await Achievement.distinct("student", { category });
    students = students.filter((student) => achievementStudentIds.some((id) => String(id) === String(student._id)));
  }

  res.json({ students });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  if (req.user.role === "student" && String(student.user) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (req.user.role === "faculty" && student.department !== req.user.department) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const [achievements, documents] = await Promise.all([
    Achievement.find({ student: student._id }).sort({ date: -1 }),
    Document.find({ student: student._id }).sort({ createdAt: -1 }),
  ]);

  res.json({ student, achievements, documents });
});

export const adminUpdateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json({ student });
});
