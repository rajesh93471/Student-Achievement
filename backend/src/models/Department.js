import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    hodName: { type: String, trim: true },
  },
  { timestamps: true }
);

const Department = mongoose.model("Department", departmentSchema);
export default Department;
