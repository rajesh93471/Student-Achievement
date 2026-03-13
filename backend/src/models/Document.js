import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "marksheet",
        "certificate",
        "internship-letter",
        "publication",
        "award",
        "aadhaar",
        "pan",
        "voter-id",
        "apaar-abc-id",
        "other",
      ],
      required: true,
      index: true,
    },
    fileUrl: { type: String, required: true, trim: true },
    fileKey: { type: String, required: true, trim: true },
    mimeType: { type: String, trim: true },
    size: { type: Number, max: 5 * 1024 * 1024 },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
export default Document;
