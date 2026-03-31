import User from "../models/User.js";
import Student from "../models/Student.js";
import Achievement from "../models/Achievement.js";
import Document from "../models/Document.js";
import Department from "../models/Department.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateExcelReport, generatePdfReport } from "../services/reportService.js";

export const createStudent = asyncHandler(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password || "ChangeMe123!",
    role: "student",
    department: req.body.department,
  });

  const student = await Student.create({
    user: user._id,
    studentId: req.body.studentId,
    fullName: req.body.name,
    department: req.body.department,
    program: req.body.program,
    admissionCategory: req.body.admissionCategory,
    year: req.body.year,
    semester: req.body.semester,
    email: req.body.email,
    phone: req.body.phone,
  });

  res.status(201).json({ student });
});

export const bulkCreateStudents = asyncHandler(async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const results = [];

  for (const row of rows) {
    const name = row.name || row.fullname || row.fullName;
    const email = row.email;
    const studentId = row.studentid || row.studentId;
    const department = row.department;
    const program = row.program;
    const year = Number(row.year);
    const semester = Number(row.semester);
    const admissionCategory = row.admissioncategory || row.admissionCategory;
    const phone = row.phone;
    const password = row.password || "ChangeMe123!";

    if (!name || !email || !studentId || !department || !program || !year || !semester) {
      results.push({ studentId, status: "failed", reason: "Missing required fields" });
      continue;
    }

    const existingUser = await User.findOne({ email });
    const existingStudent = await Student.findOne({ studentId });
    if (existingUser || existingStudent) {
      results.push({ studentId, status: "failed", reason: "User or student already exists" });
      continue;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "student",
      department,
    });

    await Student.create({
      user: user._id,
      studentId,
      fullName: name,
      department,
      program,
      admissionCategory,
      year,
      semester,
      email,
      phone,
      cgpa: row.cgpa ? Number(row.cgpa) : undefined,
    });

    results.push({ studentId, status: "created" });
  }

  res.status(201).json({ results });
});

export const bulkUpdateStudents = asyncHandler(async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];
  const results = [];

  for (const row of rows) {
    const studentId = row.studentid || row.studentId;
    if (!studentId) {
      results.push({ studentId, status: "failed", reason: "Missing studentId" });
      continue;
    }

    const student = await Student.findOne({ studentId });
    if (!student) {
      results.push({ studentId, status: "failed", reason: "Student not found" });
      continue;
    }

    const updates = {
      fullName: row.fullname || row.fullName || row.name || student.fullName,
      department: row.department || student.department,
      program: row.program || student.program,
      admissionCategory: row.admissioncategory || row.admissionCategory || student.admissionCategory,
      year: row.year ? Number(row.year) : student.year,
      semester: row.semester ? Number(row.semester) : student.semester,
      email: row.email || student.email,
      phone: row.phone || student.phone,
      cgpa: row.cgpa ? Number(row.cgpa) : student.cgpa,
    };

    Object.assign(student, updates);
    await student.save();

    await User.findByIdAndUpdate(student.user, {
      name: updates.fullName,
      email: updates.email,
      department: updates.department,
    });

    results.push({ studentId, status: "updated" });
  }

  res.json({ results });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  await Promise.all([
    User.findByIdAndDelete(student.user),
    Achievement.deleteMany({ student: student._id }),
    Document.deleteMany({ student: student._id }),
    student.deleteOne(),
  ]);
  res.json({ message: "Student removed" });
});

export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalStudents,
    totalAchievements,
    pendingApprovals,
    totalDocuments,
    departmentData,
    topStudents,
    categoryData,
    yearlyGrowth,
  ] = await Promise.all([
    Student.countDocuments(),
    Achievement.countDocuments(),
    Achievement.countDocuments({ status: "pending" }),
    Document.countDocuments(),
    Student.aggregate([
      { $group: { _id: "$department", totalStudents: { $sum: 1 } } },
      { $sort: { totalStudents: -1 } },
    ]),
    Student.find()
      .sort({ cgpa: -1, achievementsCount: -1 })
      .limit(5)
      .select("fullName studentId department cgpa achievementsCount"),
    Achievement.aggregate([
      { $group: { _id: "$category", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Achievement.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.json({
    metrics: { totalStudents, totalAchievements, pendingApprovals, totalDocuments },
    departmentData,
    topStudents,
    categoryData,
    yearlyGrowth,
  });
});

export const getAnalyticsInsights = asyncHandler(async (_req, res) => {
  const [
    totalStudents,
    totalAchievements,
    pendingApprovals,
    totalDocuments,
    departmentData,
    categoryData,
    yearlyGrowth,
  ] = await Promise.all([
    Student.countDocuments(),
    Achievement.countDocuments(),
    Achievement.countDocuments({ status: "pending" }),
    Document.countDocuments(),
    Student.aggregate([
      { $group: { _id: "$department", totalStudents: { $sum: 1 } } },
      { $sort: { totalStudents: -1 } },
    ]),
    Achievement.aggregate([
      { $group: { _id: "$category", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Achievement.aggregate([
      {
        $group: {
          _id: { $year: "$date" },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const openAiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!openAiKey && !geminiKey) {
    return res.json({
      insights:
        "AI insights are not configured. Add GEMINI_API_KEY or OPENAI_API_KEY in the backend .env to enable automated analysis.",
    });
  }

  const snapshot = {
    metrics: { totalStudents, totalAchievements, pendingApprovals, totalDocuments },
    departmentData,
    categoryData,
    yearlyGrowth,
  };

  const systemPrompt =
    "You are an analytics assistant for a university dashboard. " +
    "Summarize trends using only the provided data. " +
    "Return 4 to 6 concise bullet points. " +
    "If data is sparse, say so and avoid guessing causes.";

  let outputText = "";

  if (geminiKey) {
    const modelPref = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const callGemini = async (modelName) =>
      fetch(
        `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt },
                  { text: `Dashboard snapshot (JSON): ${JSON.stringify(snapshot)}` },
                ],
              },
            ],
            generationConfig: { temperature: 0.2 },
          }),
        }
      );

    let aiResponse;
    try {
      aiResponse = await callGemini(modelPref);
    } catch (error) {
      console.error("Gemini request failed:", error);
      return res.status(502).json({
        message: "AI insights unavailable. Unable to reach Gemini.",
        error: error?.message || "Network error",
      });
    }

    if (!aiResponse.ok) {
      const errorJson = await aiResponse.json().catch(() => null);
      const errorText = errorJson?.error?.message || (await aiResponse.text());
      console.error("Gemini error response:", errorText);

      if (String(errorText).includes("not found") || String(errorText).includes("not supported")) {
        try {
          const listRes = await fetch(
            `https://generativelanguage.googleapis.com/v1/models?key=${geminiKey}`
          );
          const listJson = await listRes.json();
          const model = (listJson.models || []).find((m) =>
            (m.supportedGenerationMethods || []).includes("generateContent")
          );
          if (model?.name) {
            const modelName = model.name.replace("models/", "");
            const retry = await callGemini(modelName);
            if (retry.ok) {
              const retryData = await retry.json();
              outputText =
                retryData?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ||
                "No insights returned.";
              return res.json({ insights: outputText });
            }
          }
        } catch (fallbackError) {
          console.error("Gemini fallback failed:", fallbackError);
        }
      }

      return res.status(502).json({
        message: "AI insights unavailable. Gemini returned an error.",
        error: errorText,
      });
    }

    const data = await aiResponse.json();
    outputText =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("\n") ||
      "No insights returned.";
  } else if (openAiKey) {
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
    let aiResponse;
    try {
      aiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model,
          input: [
            {
              role: "system",
              content: [{ type: "input_text", text: systemPrompt }],
            },
            {
              role: "user",
              content: [
                { type: "input_text", text: `Dashboard snapshot (JSON): ${JSON.stringify(snapshot)}` },
              ],
            },
          ],
          temperature: 0.2,
        }),
      });
    } catch (error) {
      console.error("OpenAI request failed:", error);
      return res.status(502).json({
        message: "AI insights unavailable. Unable to reach OpenAI.",
        error: error?.message || "Network error",
      });
    }

    if (!aiResponse.ok) {
      const errorJson = await aiResponse.json().catch(() => null);
      const errorText = errorJson?.error?.message || (await aiResponse.text());
      console.error("OpenAI error response:", errorText);
      return res.status(502).json({
        message: "AI insights unavailable. OpenAI returned an error.",
        error: errorText,
      });
    }

    const data = await aiResponse.json();
    outputText =
      data.output_text ||
      data.output?.map((item) => item.content?.map((c) => c.text).join("")).join("\n") ||
      "No insights returned.";
  }

  res.json({ insights: outputText });
});

export const getReports = asyncHandler(async (_req, res) => {
  const [topAchievers, departmentAchievements, participation, certificationStats] = await Promise.all([
    Student.find()
      .sort({ achievementsCount: -1, cgpa: -1 })
      .limit(10)
      .select("fullName studentId department achievementsCount cgpa"),
    Achievement.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      { $group: { _id: "$student.department", totalAchievements: { $sum: 1 } } },
      { $sort: { totalAchievements: -1 } },
    ]),
    Achievement.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      { $group: { _id: "$student.department", participants: { $addToSet: "$student._id" } } },
      { $project: { participants: { $size: "$participants" } } },
    ]),
    Achievement.aggregate([
      { $match: { category: "certification" } },
      { $group: { _id: "$status", total: { $sum: 1 } } },
    ]),
  ]);

  res.json({ topAchievers, departmentAchievements, participation, certificationStats });
});

export const exportReport = asyncHandler(async (req, res) => {
  const format = req.query.format || "pdf";
  const report = req.query.report || "top-achievers";
  const topAchievers = await Student.find()
    .sort({ achievementsCount: -1, cgpa: -1 })
    .limit(10)
    .lean();

  if (format === "excel") {
    const buffer = await generateExcelReport({
      sheetName: "Top Achievers",
      columns: [
        { header: "Student ID", key: "studentId", width: 18 },
        { header: "Name", key: "fullName", width: 24 },
        { header: "Department", key: "department", width: 20 },
        { header: "CGPA", key: "cgpa", width: 10 },
        { header: "Achievements", key: "achievementsCount", width: 14 },
      ],
      rows: topAchievers,
    });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${report}.xlsx`);
    return res.send(buffer);
  }

  const lines = topAchievers.map(
    (student, index) =>
      `${index + 1}. ${student.fullName} (${student.studentId}) - ${student.department} | CGPA ${student.cgpa || 0} | Achievements ${student.achievementsCount || 0}`
  );
  const buffer = await generatePdfReport({ title: "Top Achievers Report", lines });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${report}.pdf`);
  return res.send(buffer);
});

export const getMeta = asyncHandler(async (_req, res) => {
  const [departments, admins, faculty] = await Promise.all([
    Department.find().sort({ name: 1 }),
    User.find({ role: "admin" }).select("name email"),
    User.find({ role: "faculty" }).select("name email department"),
  ]);
  res.json({ departments, admins, faculty });
});
