import mongoose from "mongoose";

const facultyProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    department: { type: String, required: true, trim: true, index: true },
    designation: { type: String, trim: true },
  },
  { timestamps: true }
);

const FacultyProfile = mongoose.model("FacultyProfile", facultyProfileSchema);
export default FacultyProfile;
