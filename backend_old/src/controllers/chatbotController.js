import { asyncHandler } from "../utils/asyncHandler.js";
import Achievement from "../models/Achievement.js";
import Document from "../models/Document.js";
import Notification from "../models/Notification.js";
import ParentProfile from "../models/ParentProfile.js";
import Student from "../models/Student.js";
import User from "../models/User.js";

export const chatWithBot = asyncHandler(async (req, res) => {
  const { message } = req.validated.body;
  const geminiKey = process.env.GEMINI_API_KEY;
  const apiVersion = process.env.GEMINI_API_VERSION || "v1beta";
  const user = req.user;

  if (!geminiKey) {
    return res.status(400).json({
      reply: "Chatbot is not configured. Add GEMINI_API_KEY in the backend .env.",
    });
  }

  const systemPrompt =
    "You are the university portal assistant. Answer questions about the Student Achievement " +
    "and Profile Management System using the provided live data. Be concise, accurate, and helpful. " +
    "If the data is missing, say so. Use totals and counts when asked.";

  const buildLiveData = async () => {
    if (!user) {
      return { scope: "unknown", note: "No user context found." };
    }

    if (user.role === "admin") {
      const [
        totalStudents,
        totalAchievements,
        totalDocuments,
        totalParents,
        unreadNotifications,
        departmentStats,
        categoryStats,
        yearStats,
        recentAchievements,
      ] = await Promise.all([
        Student.countDocuments(),
        Achievement.countDocuments(),
        Document.countDocuments(),
        User.countDocuments({ role: "parent" }),
        Notification.countDocuments({ status: "unread" }),
        Student.aggregate([
          { $group: { _id: "$department", students: { $sum: 1 } } },
          { $sort: { students: -1 } },
        ]),
        Achievement.aggregate([
          { $group: { _id: "$category", achievements: { $sum: 1 } } },
          { $sort: { achievements: -1 } },
        ]),
        Achievement.aggregate([
          { $group: { _id: "$academicYear", achievements: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Achievement.find()
          .sort({ createdAt: -1 })
          .limit(5)
          .populate("student", "fullName studentId department"),
      ]);

      return {
        scope: "admin",
        totals: {
          students: totalStudents,
          achievements: totalAchievements,
          documents: totalDocuments,
          parents: totalParents,
        },
        notifications: { unread: unreadNotifications },
        departmentBreakdown: departmentStats,
        achievementCategories: categoryStats,
        achievementYears: yearStats,
        recentAchievements: recentAchievements.map((item) => ({
          title: item.title,
          category: item.category,
          status: item.status,
          date: item.date,
          student: item.student
            ? {
                name: item.student.fullName,
                studentId: item.student.studentId,
                department: item.student.department,
              }
            : null,
        })),
      };
    }

    let student = null;
    if (user.role === "student") {
      student = await Student.findOne({ user: user._id });
    } else if (user.role === "parent") {
      const parentProfile = await ParentProfile.findOne({ user: user._id });
      if (parentProfile?.student) {
        student = await Student.findById(parentProfile.student);
      }
    }

    if (!student) {
      return {
        scope: user.role,
        note: "No linked student record found.",
      };
    }

    const [achievements, documents] = await Promise.all([
      Achievement.find({ student: student._id })
        .sort({ createdAt: -1 })
        .limit(5),
      Document.find({ student: student._id })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      scope: user.role,
      student: {
        name: student.fullName,
        studentId: student.studentId,
        department: student.department,
        program: student.program,
        semester: student.semester,
        year: student.year,
        email: student.email,
        phone: student.phone,
        cgpa: student.cgpa,
      },
      totals: {
        achievements: student.achievementsCount,
        documents: student.documentsCount,
      },
      recentAchievements: achievements.map((item) => ({
        title: item.title,
        category: item.category,
        status: item.status,
        date: item.date,
      })),
      recentDocuments: documents.map((item) => ({
        title: item.title,
        type: item.type,
        createdAt: item.createdAt,
      })),
    };
  };

  const liveData = await buildLiveData();

  const modelPref = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const callGemini = async (modelName) =>
    fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: systemPrompt },
                { text: `Live data (JSON): ${JSON.stringify(liveData)}` },
                { text: `User question: ${message}` },
              ],
            },
          ],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

  const listModels = async () =>
    fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${geminiKey}`
    );

  const pickSupportedModel = (models = []) =>
    models.find((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      ?.name?.replace("models/", "");

  let aiResponse;
  try {
    aiResponse = await callGemini(modelPref);
  } catch (error) {
    console.error("Gemini chatbot request failed:", error);
    return res.status(502).json({
      reply: "Chatbot is unavailable right now. Please try again.",
    });
  }

  if (!aiResponse.ok) {
    const errorJson = await aiResponse.json().catch(() => null);
    const errorText = errorJson?.error?.message || (await aiResponse.text());
    console.error("Gemini chatbot error:", errorText);

    try {
      const modelResponse = await listModels();
      if (modelResponse.ok) {
        const modelJson = await modelResponse.json();
        const fallbackModel = pickSupportedModel(modelJson.models || []);
        if (fallbackModel) {
          aiResponse = await callGemini(fallbackModel);
        }
      }
    } catch (error) {
      console.error("Gemini chatbot model list failed:", error);
    }

    if (!aiResponse.ok) {
      return res.status(502).json({
        reply: "Chatbot is unavailable right now. Please try again.",
      });
    }
  }

  const data = await aiResponse.json();
  const reply =
    data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ||
    "I could not generate a response. Please rephrase your question.";

  res.json({ reply });
});
