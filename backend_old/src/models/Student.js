import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    studentId: { type: String, required: true, unique: true, trim: true, index: true },
    fullName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true, index: true },
    program: { type: String, required: true, trim: true },
    admissionCategory: { type: String, trim: true },
    year: { type: Number, required: true, min: 1, max: 6 },
    semester: { type: Number, required: true, min: 1, max: 2, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    profilePhotoUrl: { type: String, trim: true },
    cgpa: { type: Number, min: 0, max: 10, index: true },
    subjectsCompleted: [{ type: String, trim: true }],
    backlogs: { type: Number, default: 0, min: 0 },
    achievementsCount: { type: Number, default: 0 },
    documentsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
export default Student;
