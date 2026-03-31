import User from "../models/User.js";
import Student from "../models/Student.js";
import ParentProfile from "../models/ParentProfile.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/token.js";

export const registerStudent = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const existingStudent = await Student.findOne({ studentId: payload.studentId });
  if (existingStudent) {
    res.status(409);
    throw new Error("Student ID already exists");
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: "student",
    department: payload.department,
  });

  const student = await Student.create({
    user: user._id,
    studentId: payload.studentId,
    fullName: payload.name,
    department: payload.department,
    program: payload.program,
    admissionCategory: payload.admissionCategory,
    year: payload.year,
    semester: payload.semester,
    email: payload.email,
    phone: payload.phone,
  });

  res.status(201).json({
    token: generateToken(user._id, user.role),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: student.studentId,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const student = user.role === "student" ? await Student.findOne({ user: user._id }) : null;
  const parent = user.role === "parent" ? await ParentProfile.findOne({ user: user._id }) : null;

  res.json({
    token: generateToken(user._id, user.role),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      studentId: student?.studentId,
      linkedStudentId: parent?.studentId,
    },
  });
});

export const me = asyncHandler(async (req, res) => {
  const student = req.user.role === "student" ? await Student.findOne({ user: req.user._id }) : null;
  const parent = req.user.role === "parent" ? await ParentProfile.findOne({ user: req.user._id }) : null;
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      studentId: student?.studentId,
      linkedStudentId: parent?.studentId,
    },
  });
});

export const registerParent = asyncHandler(async (req, res) => {
  const payload = req.validated.body;
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const student = await Student.findOne({ studentId: payload.studentId });
  if (!student) {
    res.status(404);
    throw new Error("Student ID not found");
  }

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: "parent",
  });

  await ParentProfile.create({
    user: user._id,
    student: student._id,
    studentId: student.studentId,
    relation: payload.relation,
    phone: payload.phone,
  });

  res.status(201).json({
    token: generateToken(user._id, user.role),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      linkedStudentId: student.studentId,
    },
  });
});
