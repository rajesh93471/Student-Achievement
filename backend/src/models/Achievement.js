import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    academicYear: { type: String, trim: true, index: true },
    semester: { type: Number, min: 1, max: 12, index: true },
    category: {
      type: String,
      enum: [
        "academic",
        "hackathon",
        "competition",
        "olympiad",
        "technical",
        "certification",
        "internship",
        "project",
        "sports",
        "cultural",
        "club",
        "research"
      ],
      required: true,
      index: true,
    },
    activityType: { type: String, trim: true, index: true },
    certificateUrl: { type: String, trim: true },
    certificateKey: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
    feedback: { type: String, trim: true },
    recommendedForAward: { type: Boolean, default: false },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Achievement = mongoose.model("Achievement", achievementSchema);
export default Achievement;
