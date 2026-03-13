import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import Achievement from "../models/Achievement.js";
import Department from "../models/Department.js";
import FacultyProfile from "../models/FacultyProfile.js";
import sampleStudents from "./sampleStudents.json" with { type: "json" };

dotenv.config();

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    Student.deleteMany(),
    Achievement.deleteMany(),
    Department.deleteMany(),
    FacultyProfile.deleteMany(),
  ]);

  await Department.insertMany([
    { name: "Computer Science", code: "CSE", hodName: "Dr. Kavita Rao" },
    { name: "Electronics", code: "ECE", hodName: "Dr. Arun Bhat" },
    { name: "Management", code: "MBA", hodName: "Dr. Neha Kapoor" },
  ]);

  const admin = await User.create({
    name: "System Admin",
    email: "admin@stuach.edu",
    password: "Admin@123",
    role: "admin",
    department: "Administration",
  });

  const faculty = await User.create({
    name: "Prof. Meera Iyer",
    email: "faculty@stuach.edu",
    password: "Faculty@123",
    role: "faculty",
    department: "Computer Science",
  });

  await FacultyProfile.create({
    user: faculty._id,
    department: "Computer Science",
    designation: "Associate Professor",
  });

  for (const item of sampleStudents) {
    const user = await User.create({
      name: item.name,
      email: item.email,
      password: "Student@123",
      role: "student",
      department: item.department,
    });

    const student = await Student.create({
      user: user._id,
      studentId: item.studentId,
      fullName: item.name,
      department: item.department,
      program: item.program,
      year: item.year,
      semester: item.semester,
      email: item.email,
      phone: item.phone,
      cgpa: item.cgpa,
      backlogs: item.backlogs,
      subjectsCompleted: item.subjectsCompleted,
      achievementsCount: item.achievements.length,
    });

    await Achievement.insertMany(
      item.achievements.map((achievement) => ({
        student: student._id,
        ...achievement,
      }))
    );
  }

  console.log("Seed completed", {
    admin: admin.email,
    faculty: faculty.email,
    studentPassword: "Student@123",
  });
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
