import mongoose from "mongoose";

const parentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    studentId: { type: String, required: true, trim: true, index: true },
    relation: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

const ParentProfile = mongoose.model("ParentProfile", parentProfileSchema);
export default ParentProfile;
