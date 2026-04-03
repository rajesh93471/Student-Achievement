import {
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  generateExcelReport,
  generatePdfReport,
  generateStudentAchievementsPdf,
  generateAchievementsZip,
} from './report.service';

const TECHNICAL_CATEGORIES = [
  'hackathon',
  'competition',
  'olympiad',
  'certification',
  'internship',
  'project',
  'research',
  'academic',
];

const NON_TECHNICAL_CATEGORIES = [
  'sports',
  'cultural',
  'club',
  'leadership',
  'volunteering',
  'social-service',
  'nss',
  'ncc',
  'entrepreneurship',
  'arts',
  'literary',
  'public-speaking',
  'community',
  'other-non-technical',
];

const formatAcademicYearLabel = (value?: string | null) => {
  switch (value) {
    case 'Year 1':
      return 'I';
    case 'Year 2':
      return 'II';
    case 'Year 3':
      return 'III';
    case 'Year 4':
      return 'IV';
    default:
      return value || '-';
  }
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudent(body: any) {
    body.studentId = String(body.studentId || '')
      .trim()
      .toUpperCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existingUser) throw new ConflictException('Email already exists');
    const existingStudent = await this.prisma.student.findUnique({
      where: { studentId: body.studentId },
    });
    if (existingStudent)
      throw new ConflictException('Registration number already exists');

    const hashed = await bcrypt.hash(body.password || 'ChangeMe123!', 10);
    const user = await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashed,
        role: 'student',
        department: body.department,
      },
    });

    const student = await this.prisma.student.create({
      data: {
        userId: user.id,
        studentId: body.studentId,
        fullName: body.name,
        department: body.department,
        program: body.program,
        admissionCategory: body.admissionCategory,
        year: Number(body.year),
        semester: Number(body.semester),
        graduationYear: body.graduationYear
          ? Number(body.graduationYear)
          : null,
        email: body.email,
        phone: body.phone,
      },
    });

    return { student };
  }

  async bulkCreateStudents(body: any) {
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    const results: any[] = [];

    for (const row of rows) {
      const name = row.name || row.fullname || row.fullName;
      const email = row.email;
      const studentId = String(row.studentid || row.studentId || '')
        .trim()
        .toUpperCase();
      const department = row.department;
      const program = row.program;
      const year = Number(row.year);
      const semester = Number(row.semester);
      const graduationYear =
        row.graduationyear || row.graduationYear
          ? Number(row.graduationyear || row.graduationYear)
          : undefined;
      const admissionCategory = row.admissioncategory || row.admissionCategory;
      const phone = row.phone;
      const password = row.password || 'ChangeMe123!';

      if (
        !name ||
        !email ||
        !studentId ||
        !department ||
        !program ||
        !year ||
        !semester
      ) {
        results.push({
          studentId,
          status: 'failed',
          reason: 'Missing required fields',
        });
        continue;
      }
      if (!/^\d{3}[A-Z]{2}\d{5}$/.test(studentId)) {
        results.push({
          studentId,
          status: 'failed',
          reason: 'Invalid registration number format',
        });
        continue;
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });
      const existingStudent = await this.prisma.student.findUnique({
        where: { studentId },
      });
      if (existingUser || existingStudent) {
        results.push({
          studentId,
          status: 'failed',
          reason: 'User or student already exists',
        });
        continue;
      }

      const hashed = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          role: 'student',
          department,
        },
      });

      await this.prisma.student.create({
        data: {
          userId: user.id,
          studentId,
          fullName: name,
          department,
          program,
          admissionCategory,
          year,
          semester,
          graduationYear,
          email,
          phone,
          cgpa: row.cgpa ? Number(row.cgpa) : undefined,
        },
      });

      results.push({ studentId, status: 'created' });
    }

    return { results };
  }

  async bulkUpdateStudents(body: any) {
    const rows = Array.isArray(body?.rows) ? body.rows : [];
    const results: any[] = [];

    for (const row of rows) {
      const studentId = String(row.studentid || row.studentId || '')
        .trim()
        .toUpperCase();
      if (!studentId) {
        results.push({
          studentId,
          status: 'failed',
          reason: 'Missing studentId',
        });
        continue;
      }

      const student = await this.prisma.student.findUnique({
        where: { studentId },
      });
      if (!student) {
        results.push({
          studentId,
          status: 'failed',
          reason: 'Student not found',
        });
        continue;
      }

      const updates = {
        fullName: row.fullname || row.fullName || row.name || student.fullName,
        department: row.department || student.department,
        program: row.program || student.program,
        admissionCategory:
          row.admissioncategory ||
          row.admissionCategory ||
          student.admissionCategory,
        year: row.year ? Number(row.year) : student.year,
        semester: row.semester ? Number(row.semester) : student.semester,
        graduationYear:
          row.graduationyear || row.graduationYear
            ? Number(row.graduationyear || row.graduationYear)
            : student.graduationYear,
        email: row.email || student.email,
        phone: row.phone || student.phone,
        cgpa: row.cgpa ? Number(row.cgpa) : student.cgpa,
      };

      await this.prisma.student.update({
        where: { id: student.id },
        data: updates,
      });

      await this.prisma.user.update({
        where: { id: student.userId },
        data: {
          name: updates.fullName,
          email: updates.email,
          department: updates.department,
        },
      });

      results.push({ studentId, status: 'updated' });
    }

    return { results };
  }

  async deleteStudent(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');
    await Promise.all([
      this.prisma.user.delete({ where: { id: student.userId } }),
      this.prisma.achievement.deleteMany({ where: { studentId: student.id } }),
      this.prisma.document.deleteMany({ where: { studentId: student.id } }),
      this.prisma.student.delete({ where: { id: student.id } }),
    ]);
    return { message: 'Student removed' };
  }

  async getDashboard() {
    const [
      totalStudents,
      totalAchievements,
      pendingApprovals,
      totalDocuments,
      departmentDataRaw,
      topStudents,
      categoryDataRaw,
      yearlyGrowthRaw,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.achievement.count(),
      this.prisma.achievement.count({ where: { status: 'pending' } }),
      this.prisma.document.count(),
      this.prisma.student.groupBy({
        by: ['department'],
        _count: { _all: true },
      }),
      this.prisma.student.findMany({
        orderBy: [{ cgpa: 'desc' }, { achievementsCount: 'desc' }],
        take: 5,
        select: {
          fullName: true,
          studentId: true,
          department: true,
          cgpa: true,
          achievementsCount: true,
        },
      }),
      this.prisma.achievement.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      this.prisma.achievement.findMany({ select: { date: true } }),
    ]);

    const departmentData = departmentDataRaw
      .map((row) => ({ _id: row.department, totalStudents: row._count._all }))
      .sort((a, b) => b.totalStudents - a.totalStudents);

    const categoryData = categoryDataRaw
      .map((row) => ({ _id: row.category, total: row._count._all }))
      .sort((a, b) => b.total - a.total);

    const yearlyTotals = yearlyGrowthRaw.reduce(
      (acc: Record<string, number>, item) => {
        const year = new Date(item.date).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      },
      {},
    );
    const yearlyGrowth = Object.keys(yearlyTotals)
      .sort()
      .map((year) => ({ _id: Number(year), total: yearlyTotals[year] }));

    return {
      metrics: {
        totalStudents,
        totalAchievements,
        pendingApprovals,
        totalDocuments,
      },
      departmentData,
      topStudents,
      categoryData,
      yearlyGrowth,
    };
  }

  async getAnalyticsInsights() {
    const [
      totalStudents,
      totalAchievements,
      pendingApprovals,
      totalDocuments,
      departmentDataRaw,
      categoryDataRaw,
      yearlyGrowthRaw,
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.achievement.count(),
      this.prisma.achievement.count({ where: { status: 'pending' } }),
      this.prisma.document.count(),
      this.prisma.student.groupBy({
        by: ['department'],
        _count: { _all: true },
      }),
      this.prisma.achievement.groupBy({
        by: ['category'],
        _count: { _all: true },
      }),
      this.prisma.achievement.findMany({ select: { date: true } }),
    ]);

    const departmentData = departmentDataRaw
      .map((row) => ({ _id: row.department, totalStudents: row._count._all }))
      .sort((a, b) => b.totalStudents - a.totalStudents);

    const categoryData = categoryDataRaw
      .map((row) => ({ _id: row.category, total: row._count._all }))
      .sort((a, b) => b.total - a.total);

    const yearlyTotals = yearlyGrowthRaw.reduce(
      (acc: Record<string, number>, item) => {
        const year = new Date(item.date).getFullYear();
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      },
      {},
    );
    const yearlyGrowth = Object.keys(yearlyTotals)
      .sort()
      .map((year) => ({ _id: Number(year), total: yearlyTotals[year] }));

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!openAiKey && !geminiKey) {
      return {
        insights:
          'AI insights are not configured. Add GEMINI_API_KEY or OPENAI_API_KEY in the backend .env to enable automated analysis.',
      };
    }

    const snapshot = {
      metrics: {
        totalStudents,
        totalAchievements,
        pendingApprovals,
        totalDocuments,
      },
      departmentData,
      categoryData,
      yearlyGrowth,
    };

    const systemPrompt =
      'You are an analytics assistant for a university dashboard. ' +
      'Summarize trends using only the provided data. ' +
      'Return 4 to 6 concise bullet points. ' +
      'If data is sparse, say so and avoid guessing causes.';

    let outputText = '';

    if (geminiKey) {
      const modelPref = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
      const callGemini = async (modelName: string) =>
        fetch(
          `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: systemPrompt },
                    {
                      text: `Dashboard snapshot (JSON): ${JSON.stringify(snapshot)}`,
                    },
                  ],
                },
              ],
              generationConfig: { temperature: 0.2 },
            }),
          },
        );

      let aiResponse: any;
      try {
        aiResponse = await callGemini(modelPref);
      } catch (error: any) {
        return {
          message: 'AI insights unavailable. Unable to reach Gemini.',
          error: error?.message || 'Network error',
        };
      }

      if (!aiResponse.ok) {
        const errorJson = await aiResponse.json().catch(() => null);
        const errorText =
          errorJson?.error?.message || (await aiResponse.text());

        if (
          String(errorText).includes('not found') ||
          String(errorText).includes('not supported')
        ) {
          try {
            const listRes = await fetch(
              `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${geminiKey}`,
            );
            const listJson = await listRes.json();
            const model = (listJson.models || []).find((m: any) =>
              (m.supportedGenerationMethods || []).includes('generateContent'),
            );
            if (model?.name) {
              const modelName = model.name.replace('models/', '');
              const retry = await callGemini(modelName);
              if (retry.ok) {
                const retryData = await retry.json();
                outputText =
                  retryData?.candidates?.[0]?.content?.parts
                    ?.map((p: any) => p.text)
                    .join('\n') || 'No insights returned.';
                return { insights: outputText };
              }
            }
          } catch (_fallbackError) {
            return {
              message: 'AI insights unavailable. Gemini fallback failed.',
              error: errorText,
            };
          }
        }

        return {
          message: 'AI insights unavailable. Gemini returned an error.',
          error: errorText,
        };
      }

      const data = await aiResponse.json();
      outputText =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text)
          .join('\n') || 'No insights returned.';
    } else if (openAiKey) {
      const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
      let aiResponse: any;
      try {
        aiResponse = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model,
            input: [
              {
                role: 'system',
                content: [{ type: 'input_text', text: systemPrompt }],
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'input_text',
                    text: `Dashboard snapshot (JSON): ${JSON.stringify(snapshot)}`,
                  },
                ],
              },
            ],
            temperature: 0.2,
          }),
        });
      } catch (error: any) {
        return {
          message: 'AI insights unavailable. Unable to reach OpenAI.',
          error: error?.message || 'Network error',
        };
      }

      if (!aiResponse.ok) {
        const errorJson = await aiResponse.json().catch(() => null);
        const errorText =
          errorJson?.error?.message || (await aiResponse.text());
        return {
          message: 'AI insights unavailable. OpenAI returned an error.',
          error: errorText,
        };
      }

      const data = await aiResponse.json();
      outputText =
        data.output_text ||
        data.output
          ?.map((item: any) => item.content?.map((c: any) => c.text).join(''))
          .join('\n') ||
        'No insights returned.';
    }

    return { insights: outputText };
  }

  async getReports(query: any = {}) {
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 10));
    const [topAchievers, achievementsWithDepartment, certificationStatsRaw] =
      await Promise.all([
        this.prisma.student.findMany({
          orderBy: [{ achievementsCount: 'desc' }, { cgpa: 'desc' }],
          take: limit,
          select: {
            fullName: true,
            studentId: true,
            department: true,
            achievementsCount: true,
            cgpa: true,
          },
        }),
        this.prisma.achievement.findMany({
          select: {
            studentId: true,
            student: { select: { department: true } },
          },
        }),
        this.prisma.achievement.groupBy({
          by: ['status'],
          where: { category: 'certification' },
          _count: { _all: true },
        }),
      ]);

    const departmentTotals = achievementsWithDepartment.reduce(
      (acc: Record<string, number>, item) => {
        const dept = item.student?.department || 'Unknown';
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      },
      {},
    );
    const departmentAchievements = Object.entries(departmentTotals)
      .map(([dept, total]) => ({ _id: dept, totalAchievements: total }))
      .sort((a, b) => b.totalAchievements - a.totalAchievements);

    const participantsByDepartment = achievementsWithDepartment.reduce(
      (acc: Record<string, Set<string>>, item) => {
        const dept = item.student?.department || 'Unknown';
        if (!acc[dept]) acc[dept] = new Set();
        acc[dept].add(item.studentId);
        return acc;
      },
      {},
    );
    const participation = Object.entries(participantsByDepartment).map(
      ([dept, set]) => ({
        _id: dept,
        participants: set.size,
      }),
    );

    const certificationStats = certificationStatsRaw.map((row) => ({
      _id: row.status,
      total: row._count._all,
    }));

    return {
      topAchievers,
      departmentAchievements,
      participation,
      certificationStats,
      limit,
    };
  }

  async exportReport(query: any, res: Response) {
    const format = query.format || 'pdf';
    const report = query.report || 'top-achievers';
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 10));

    if (report === 'student-achievements') {
      const selectedYear = query.year;
      const selectedAchievementYear = query.achievementYear;
      const selectedGroup = query.group;
      const selectedCategory = query.category;
      const where: any = {};
      where.status = 'approved';

      if (selectedCategory && selectedCategory !== 'all') {
        where.category = selectedCategory;
      } else if (selectedGroup === 'technical') {
        where.category = { in: TECHNICAL_CATEGORIES };
      } else if (selectedGroup === 'non-technical') {
        where.category = { in: NON_TECHNICAL_CATEGORIES };
      }

      if (selectedYear && selectedYear !== 'all') {
        where.student = {
          ...(where.student || {}),
          graduationYear: Number(selectedYear),
        };
      }

      if (selectedAchievementYear && selectedAchievementYear !== 'all') {
        where.date = {
          gte: new Date(`${selectedAchievementYear}-01-01T00:00:00.000Z`),
          lt: new Date(
            `${Number(selectedAchievementYear) + 1}-01-01T00:00:00.000Z`,
          ),
        };
      }

      const achievements = await this.prisma.achievement.findMany({
        where,
        include: {
          student: {
            select: {
              fullName: true,
              studentId: true,
              department: true,
              graduationYear: true,
            },
          },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      });

      const titleParts = [
        'Student Achievements Report',
        selectedYear && selectedYear !== 'all'
          ? `Graduation Year ${selectedYear}`
          : 'All Graduation Years',
        selectedAchievementYear && selectedAchievementYear !== 'all'
          ? `Achievement Year ${selectedAchievementYear}`
          : 'All Achievement Years',
        selectedCategory && selectedCategory !== 'all'
          ? `Category ${selectedCategory}`
          : selectedGroup
            ? `${selectedGroup} stream`
            : '',
      ].filter(Boolean);

      if (format === 'zip') {
        const archive = await generateAchievementsZip(achievements);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="student-achievements.zip"',
        );
        archive.pipe(res);
        return;
      }

      if (format === 'excel') {
        const rows = achievements.map((item) => ({
          'Student Name': item.student?.fullName || 'Student',
          'Registration Number': item.student?.studentId || '-',
          Department: item.student?.department || '-',
          'Graduation Year':
            item.student?.graduationYear != null
              ? String(item.student.graduationYear)
              : '-',
          'Achievement Stream': TECHNICAL_CATEGORIES.includes(item.category)
            ? 'Technical'
            : 'Non-technical',
          Category: item.category || '-',
          Title: item.title || '-',
          Description: item.description || '-',
          'Date of Achievement': item.date
            ? new Date(item.date).toLocaleDateString('en-CA')
            : '-',
          'Academic Year': formatAcademicYearLabel(item.academicYear),
          Semester: item.semester != null ? String(item.semester) : '-',
          'Activity Type': item.activityType || '-',
          'Organized By': item.organizedBy || '-',
          Position: item.position || '-',
          Status: item.status || '-',
          'Certificate Link': item.certificateUrl || '-',
        }));

        const buffer = await generateExcelReport({
          sheetName: 'Student Achievements',
          columns: [
            { header: 'Student Name', key: 'Student Name', width: 24 },
            {
              header: 'Registration Number',
              key: 'Registration Number',
              width: 22,
            },
            { header: 'Department', key: 'Department', width: 18 },
            { header: 'Graduation Year', key: 'Graduation Year', width: 16 },
            {
              header: 'Achievement Stream',
              key: 'Achievement Stream',
              width: 18,
            },
            { header: 'Category', key: 'Category', width: 18 },
            { header: 'Title', key: 'Title', width: 28 },
            { header: 'Description', key: 'Description', width: 40 },
            {
              header: 'Date of Achievement',
              key: 'Date of Achievement',
              width: 18,
            },
            { header: 'Academic Year', key: 'Academic Year', width: 16 },
            { header: 'Semester', key: 'Semester', width: 12 },
            { header: 'Activity Type', key: 'Activity Type', width: 18 },
            { header: 'Organized By', key: 'Organized By', width: 18 },
            { header: 'Position', key: 'Position', width: 18 },
            { header: 'Status', key: 'Status', width: 14 },
            { header: 'Certificate Link', key: 'Certificate Link', width: 48 },
          ],
          rows,
        });
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=student-achievements.xlsx',
        );
        return res.send(buffer);
      }

      const buffer = await generateStudentAchievementsPdf({
        title: titleParts.join(' - '),
        achievements,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=student-achievements.pdf',
      );
      return res.send(buffer);
    }

    const topAchievers = await this.prisma.student.findMany({
      orderBy: [{ achievementsCount: 'desc' }, { cgpa: 'desc' }],
      take: limit,
    });

    if (format === 'excel') {
      const buffer = await generateExcelReport({
        sheetName: 'Top Achievers',
        columns: [
          { header: 'Student ID', key: 'studentId', width: 18 },
          { header: 'Name', key: 'fullName', width: 24 },
          { header: 'Department', key: 'department', width: 20 },
          { header: 'CGPA', key: 'cgpa', width: 10 },
          { header: 'Achievements', key: 'achievementsCount', width: 14 },
        ],
        rows: topAchievers,
      });
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${report}.xlsx`,
      );
      return res.send(buffer);
    }

    const lines = topAchievers.map(
      (student: any, index: number) =>
        `${index + 1}. ${student.fullName} (${student.studentId}) - ${student.department} | CGPA ${student.cgpa || 0} | Achievements ${student.achievementsCount || 0}`,
    );
    const buffer = await generatePdfReport({
      title: 'Top Achievers Report',
      lines,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${report}.pdf`);
    return res.send(buffer);
  }

  async getMeta() {
    const [departments, admins, faculty, graduationYearsRaw] =
      await Promise.all([
        this.prisma.department.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.user.findMany({
          where: { role: 'admin' },
          select: { name: true, email: true },
        }),
        this.prisma.user.findMany({
          where: { role: 'faculty' },
          select: { name: true, email: true, department: true },
        }),
        this.prisma.student.findMany({
          select: { graduationYear: true },
          distinct: ['graduationYear'],
        }),
      ]);

    const graduationYears = graduationYearsRaw
      .map((s) => s.graduationYear)
      .filter((y) => y !== null)
      .sort((a, b) => b - a);

    return { departments, admins, faculty, graduationYears };
  }
}
