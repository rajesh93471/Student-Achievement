import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("settings");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ settings: user.settings });
});

export const updateMySettings = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.settings = {
    ...user.settings,
    ...req.validated.body,
  };

  await user.save();
  res.json({ settings: user.settings });
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated" });
});
