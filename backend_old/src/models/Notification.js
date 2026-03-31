import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    senderName: { type: String, trim: true },
    senderEmail: { type: String, trim: true },
    senderRole: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["unread", "read"], default: "unread", index: true },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
