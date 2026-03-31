import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createNotification = asyncHandler(async (req, res) => {
  const { message } = req.validated.body;
  const notification = await Notification.create({
    sender: req.user._id,
    senderName: req.user.name,
    senderEmail: req.user.email,
    senderRole: req.user.role,
    message,
  });

  res.status(201).json({ notification });
});

export const getNotifications = asyncHandler(async (_req, res) => {
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ notifications });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  notification.status = "read";
  await notification.save();
  res.json({ notification });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  await notification.deleteOne();
  res.json({ message: "Notification deleted" });
});
