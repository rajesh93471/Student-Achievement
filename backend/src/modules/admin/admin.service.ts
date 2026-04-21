import {
  ConflictException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  generateExcelReport,
  generatePdfReport,
  generateStudentAchievementsPdf,
  generateStudentDocumentsPdf,
  generateAchievementsZip,
  generateDocumentsZip,
} from './report.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';

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

const graduationYearFromStudentId = (studentId: string) => {
  const batch = Number(String(studentId || '').slice(0, 2));
  return Number.isFinite(batch) ? 2000 + batch + 4 : null;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createStudent(body: CreateStudentDto) {
    try {
      console.log('[CreateStudent] Starting process for:', body.email);
      body.studentId = String(body.studentId || '')
        .trim()
        .toUpperCase();
      
      console.log('[CreateStudent] Checking existing user/student...');
      const existingUser = await this.prisma.user.findUnique({
        where: { email: body.email },
      });
      if (existingUser) throw new ConflictException('Email already exists');
      const existingStudent = await this.prisma.student.findUnique({
        where: { studentId: body.studentId },
      });
      if (existingStudent)
        throw new ConflictException('Registration number already exists');

      console.log('[CreateStudent] Hashing password...');
      const hashed = await bcrypt.hash(body.password || 'temp123', 10);
      
      console.log('[CreateStudent] Creating User record...');
      const user = await this.prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashed,
          role: 'student',
          department: 'CSE',
        },
      });
      console.log('[CreateStudent] User created with ID:', user.id);

      console.log('[CreateStudent] Creating Student record with data:', {
        userId: user.id,
        studentId: body.studentId,
        year: Number(body.year),
        semester: Number(body.semester),
        section: body.section
      });
      const student = await this.prisma.student.create({
        data: {
          userId: user.id,
          studentId: body.studentId,
          fullName: body.name,
          department: 'CSE',
          program: body.program,
          admissionCategory: body.admissionCategory,
          year: Number(body.year) || 1,
          semester: Number(body.semester) || 1,
          graduationYear:
            graduationYearFromStudentId(body.studentId) ??
            (body.graduationYear ? Number(body.graduationYear) : null),
          email: body.email,
          phone: body.phone,
          section: body.section,
          counsellorId: (body as any).counsellorId || null,
        },
      });
      console.log('[CreateStudent] Student created with ID:', student.id);

      console.log('[CreateStudent] Triggering autoAssignStudent...');
      await this.autoAssignStudent(student.id);

      console.log('[CreateStudent] Process completed successfully.');
      return { student };
    } catch (error) {
      console.error('[CreateStudent] Error occurred:', error);
      throw error;
    }
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
          : graduationYearFromStudentId(studentId) ?? undefined;
      const admissionCategory = row.admissioncategory || row.admissionCategory;
      const phone = row.phone;
      const password = row.password || 'temp123';
      const counsellorId = row.counsellorId || row.counsellorid;

      if (
        !name ||
        !email ||
        !studentId ||
        !department ||
        !program ||
        !year
      ) {
        results.push({
          studentId,
          status: 'failed',
          reason: 'Missing required fields (Name, Email, Student ID, Dept, Program, or Year)',
        });
        continue;
      }
      if (!/^\d{3}[A-Z]{2}[A-Z0-9]{5}$/.test(studentId)) {
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
          department: 'CSE',
        },
      });

      await this.prisma.student.create({
        data: {
          userId: user.id,
          studentId,
          fullName: name,
          department: 'CSE',
          program,
          admissionCategory,
          year,
          semester,
          graduationYear,
          email,
          phone,
          cgpa: row.cgpa ? Number(row.cgpa) : undefined,
          section: row.section,
          counsellorId,
        },
      });

      await this.autoAssignStudent(studentId, true);

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
        department: 'CSE',
        program: row.program || student.program,
        admissionCategory:
          row.admissioncategory ||
          row.admissionCategory ||
          student.admissionCategory,
        year: row.year ? Number(row.year) : student.year,
        semester: row.semester ? Number(row.semester) : student.semester,
        graduationYear:
          graduationYearFromStudentId(studentId) ??
          (row.graduationyear || row.graduationYear
            ? Number(row.graduationyear || row.graduationYear)
            : student.graduationYear),
        email: row.email || student.email,
        phone: row.phone || student.phone,
        cgpa: row.cgpa ? Number(row.cgpa) : student.cgpa,
        counsellorId: row.counsellorId || row.counsellorid || student.counsellorId,
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
          department: 'CSE',
        },
      });
      
      await this.autoAssignStudent(student.id);

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

  async bulkDeleteStudents(ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) return { deleted: 0 };
    
    // Perform deletion in chunks or sequentially for safety
    let count = 0;
    for (const id of ids) {
      try {
        const student = await this.prisma.student.findUnique({ where: { id } });
        if (!student) continue;
        
        await Promise.all([
          this.prisma.user.delete({ where: { id: student.userId } }),
          this.prisma.achievement.deleteMany({ where: { studentId: id } }),
          this.prisma.document.deleteMany({ where: { studentId: id } }),
          this.prisma.student.delete({ where: { id } })
        ]);
        count++;
      } catch (err) {
        console.error(`Failed to delete student ${id}:`, err);
      }
    }
    return { deleted: count };
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
      this.prisma.achievement.count({ where: { status: "pending" } }),
      this.prisma.document.count(),
      this.prisma.student.groupBy({
        by: ["department"],
        _count: { _all: true },
      }),
      this.prisma.student.findMany({
        orderBy: [{ cgpa: "desc" }, { achievementsCount: "desc" }],
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
        by: ["category"],
        _count: { _all: true },
      }),
      this.prisma.$queryRaw<Array<{ _id: number; total: bigint }>>`
        SELECT YEAR(date) as _id, COUNT(*) as total 
        FROM Achievement 
        WHERE date IS NOT NULL 
        GROUP BY YEAR(date) 
        ORDER BY _id ASC
      `,
    ]);

    const departmentData = departmentDataRaw
      .map((row) => ({ _id: row.department, totalStudents: row._count._all }))
      .sort((a, b) => b.totalStudents - a.totalStudents);

    const categoryData = categoryDataRaw
      .map((row) => ({ _id: row.category, total: row._count._all }))
      .sort((a, b) => b.total - a.total);

    const yearlyGrowth = (yearlyGrowthRaw as any[]).map((row) => ({
      _id: Number(row._id),
      total: Number(row.total),
    }));

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
      this.prisma.achievement.count({ where: { status: "pending" } }),
      this.prisma.document.count(),
      this.prisma.student.groupBy({
        by: ["department"],
        _count: { _all: true },
      }),
      this.prisma.achievement.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
      this.prisma.$queryRaw<Array<{ _id: number; total: bigint }>>`
        SELECT YEAR(date) as _id, COUNT(*) as total 
        FROM Achievement 
        WHERE date IS NOT NULL 
        GROUP BY YEAR(date) 
        ORDER BY _id ASC
      `,
    ]);

    const departmentData = departmentDataRaw
      .map((row) => ({ _id: row.department, totalStudents: row._count._all }))
      .sort((a, b) => b.totalStudents - a.totalStudents);

    const categoryData = categoryDataRaw
      .map((row) => ({ _id: row.category, total: row._count._all }))
      .sort((a, b) => b.total - a.total);

    const yearlyGrowth = (yearlyGrowthRaw as any[]).map((row) => ({
      _id: Number(row._id),
      total: Number(row.total),
    }));

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
    const selectedYear = query.year || query.graduationYear;
    const studentWhere: any = {};
    if (selectedYear && selectedYear !== 'all') {
      studentWhere.graduationYear = Number(selectedYear);
    }

    const [topAchievers, achievementsWithDepartment, certificationStatsRaw] =
      await Promise.all([
        this.prisma.student.findMany({
          where: studentWhere,
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
      const selectedSection = query.section;
      const selectedGroup = query.group;
      const selectedCategory = query.category;
      const studentSearch = String(query.student || '').trim();
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

      if (selectedSection && selectedSection !== 'all') {
        where.student = {
          ...(where.student || {}),
          section: selectedSection,
        };
      }

      if (studentSearch) {
        where.student = {
          ...(where.student || {}),
          OR: [
            { fullName: { contains: studentSearch } },
            { studentId: { contains: studentSearch } },
          ],
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
              section: true,
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
        selectedSection && selectedSection !== 'all'
          ? `Section ${selectedSection}`
          : '',
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
          Section: item.student?.section || '-',
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
            { header: 'Section', key: 'Section', width: 12 },
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

    if (report === 'student-documents') {
      const selectedYear = query.year;
      const selectedSection = query.section;
      const selectedType = query.type;
      const studentSearch = String(query.student || '').trim();
      const where: any = {};

      if (selectedType && selectedType !== 'all') {
        where.type = selectedType;
      }

      if (selectedYear && selectedYear !== 'all') {
        where.student = {
          ...(where.student || {}),
          graduationYear: Number(selectedYear),
        };
      }

      if (selectedSection && selectedSection !== 'all') {
        where.student = {
          ...(where.student || {}),
          section: selectedSection,
        };
      }

      if (studentSearch) {
        where.student = {
          ...(where.student || {}),
          OR: [
            { fullName: { contains: studentSearch } },
            { studentId: { contains: studentSearch } },
          ],
        };
      }

      const documents = await this.prisma.document.findMany({
        where,
        include: {
          student: {
            select: {
              fullName: true,
              studentId: true,
              department: true,
              graduationYear: true,
              section: true,
            },
          },
        },
        orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      });

      const titleParts = [
        'Student Documents Report',
        selectedType && selectedType !== 'all' ? `Type ${selectedType}` : 'All Types',
        studentSearch ? `Student ${studentSearch}` : '',
      ].filter(Boolean);

      if (format === 'zip') {
        const archive = await generateDocumentsZip(documents);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="student-documents.zip"',
        );
        archive.pipe(res);
        return;
      }

      if (format === 'excel') {
        const rows = documents.map((item) => ({
          'Student Name': item.student?.fullName || 'Student',
          'Registration Number': item.student?.studentId || '-',
          Department: item.student?.department || '-',
          Section: item.student?.section || '-',
          'Graduation Year':
            item.student?.graduationYear != null
              ? String(item.student.graduationYear)
              : '-',
          'Document Title': item.title || '-',
          'Document Type': item.type || '-',
          'Mime Type': item.mimeType || '-',
          Size: item.size != null ? String(item.size) : '-',
          'Created At': item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-CA')
            : '-',
          'File Link': item.fileUrl || '-',
        }));

        const buffer = await generateExcelReport({
          sheetName: 'Student Documents',
          columns: [
            { header: 'Student Name', key: 'Student Name', width: 24 },
            {
              header: 'Registration Number',
              key: 'Registration Number',
              width: 22,
            },
            { header: 'Department', key: 'Department', width: 18 },
            { header: 'Section', key: 'Section', width: 12 },
            { header: 'Graduation Year', key: 'Graduation Year', width: 16 },
            { header: 'Document Title', key: 'Document Title', width: 28 },
            { header: 'Document Type', key: 'Document Type', width: 18 },
            { header: 'Mime Type', key: 'Mime Type', width: 20 },
            { header: 'Size', key: 'Size', width: 14 },
            { header: 'Created At', key: 'Created At', width: 16 },
            { header: 'File Link', key: 'File Link', width: 48 },
          ],
          rows,
        });
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=student-documents.xlsx',
        );
        return res.send(buffer);
      }

      const buffer = await generateStudentDocumentsPdf({
        title: titleParts.join(' - '),
        documents,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=student-documents.pdf',
      );
      return res.send(buffer);
    }

    if (report === 'faculty-assignments') {
      const facultyId = query.facultyId;
      const where: any = {};
      if (facultyId) where.facultyId = facultyId;

      const assignments = await this.prisma.assignment.findMany({
        where,
        include: {
          student: {
            select: {
              fullName: true,
              studentId: true,
              department: true,
              section: true,
              year: true,
            },
          },
          faculty: {
            select: {
              fullName: true,
              employeeId: true,
            },
          },
        },
      });

      const rows = assignments.map((a) => ({
        'Faculty Name': a.faculty.fullName,
        'Employee ID': a.faculty.employeeId,
        'Student Name': a.student.fullName,
        'Student ID': a.student.studentId,
        Department: a.student.department,
        Section: a.student.section,
        Year: a.student.year,
      }));

      const buffer = await generateExcelReport({
        sheetName: 'Faculty Assignments',
        columns: [
          { header: 'Faculty Name', key: 'Faculty Name', width: 24 },
          { header: 'Employee ID', key: 'Employee ID', width: 18 },
          { header: 'Student Name', key: 'Student Name', width: 24 },
          { header: 'Student ID', key: 'Student ID', width: 18 },
          { header: 'Department', key: 'Department', width: 16 },
          { header: 'Section', key: 'Section', width: 12 },
          { header: 'Year', key: 'Year', width: 12 },
        ],
        rows,
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=faculty-assignments.xlsx`,
      );
      return res.send(buffer);
    }

    const selectedYear = query.year || query.graduationYear;
    const where: any = {};
    if (selectedYear && selectedYear !== 'all') {
      where.graduationYear = Number(selectedYear);
    }

    const topAchievers = await this.prisma.student.findMany({
      where,
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
          { header: 'Graduation Year', key: 'graduationYear', width: 16 },
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
    const [departments, admins, graduationYearsRaw, sectionsRaw] =
      await Promise.all([
        this.prisma.department.findMany({ orderBy: { name: 'asc' } }),
        this.prisma.user.findMany({
          where: { role: 'admin' },
          select: { name: true, email: true },
        }),
        this.prisma.student.findMany({
          select: { graduationYear: true },
          distinct: ['graduationYear'],
        }),
        this.prisma.student.findMany({
          where: { section: { not: null } },
          select: { section: true },
          distinct: ['section'],
          orderBy: { section: 'asc' },
        }),
      ]);

    const graduationYears = graduationYearsRaw
      .map((s) => s.graduationYear)
      .filter((y) => y !== null)
      .sort((a, b) => b - a);

    const sections = sectionsRaw
      .map((s) => s.section)
      .filter((s) => s !== null);

    return { departments, admins, graduationYears, sections };
  }

  private getCellText(value: any) {
    if (value && typeof value === 'object') {
      if ('result' in value) value = value.result;
      if (value && typeof value === 'object' && 'text' in value) {
        value = value.text;
      }
      if (value && typeof value === 'object' && 'hyperlink' in value) {
        value = value.text || value.hyperlink;
      }
    }
    return String(value ?? '').trim();
  }

  private normalizeImportHeader(value: any) {
    return this.getCellText(value)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  private mapStudentImportHeader(value: any) {
    const header = this.normalizeImportHeader(value);
    if (!header) return '';

    if (
      header === 'registerno' ||
      header === 'registrationno' ||
      header === 'registrationnumber' ||
      header === 'studentid' ||
      header === 'rollno' ||
      header === 'id'
    ) {
      return 'studentId';
    }
    if (
      header === 'name' ||
      header === 'studentname' ||
      header === 'fullname' ||
      header === 'fullName'
    ) {
      return 'fullName';
    }
    if (
      header === 'counsellorname' ||
      header === 'counselorname' ||
      header === 'facultyname' ||
      header === 'mentorname'
    ) {
      return 'counsellorName';
    }
    if (
      header === 'counsellorid' ||
      header === 'counselorid' ||
      header === 'facultyid' ||
      header === 'mentorid'
    ) {
      return 'counsellorId';
    }
    if (header === 'section' || header === 'sectioncode') return 'section';
    if (header === 'email' || header === 'mail' || header === 'emailid') {
      return 'email';
    }
    if (header.includes('department') || header === 'dept' || header === 'branch') {
      return 'department';
    }
    if (header === 'program' || header === 'course') return 'program';
    if (header === 'graduationyear' || header === 'gradyear') {
      return 'graduationYear';
    }
    if (header === 'year' || header === 'academicyear') return 'year';
    if (header === 'semester' || header === 'sem') return 'semester';
    if (header === 'cgpa' || header === 'gpa') return 'cgpa';
    if (header === 'phone' || header === 'mobile' || header === 'contact') {
      return 'phone';
    }
    if (header === 'password') return 'password';
    return '';
  }

  private parseCsvRows(buffer: Buffer) {
    const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
    const rows: string[][] = [];
    let current = '';
    let row: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i++;
        row.push(current.trim());
        current = '';
        if (row.some((cell) => cell !== '')) rows.push(row);
        row = [];
        continue;
      }

      current += char;
    }

    if (current || row.length > 0) {
      row.push(current.trim());
      if (row.some((cell) => cell !== '')) rows.push(row);
    }

    return rows;
  }

  private async parseStudentImportRows(file: Express.Multer.File) {
    const originalName = String(file.originalname || '').toLowerCase();
    const mimetype = String(file.mimetype || '').toLowerCase();
    const isCsv = originalName.endsWith('.csv') || mimetype.includes('csv');
    const rows: any[] = [];
    const headers: Record<number, string> = {};

    if (isCsv) {
      const csvRows = this.parseCsvRows(file.buffer);
      const headerRow = csvRows[0] || [];
      headerRow.forEach((cell, index) => {
        const mapped = this.mapStudentImportHeader(cell);
        if (mapped) headers[index + 1] = mapped;
      });

      csvRows.slice(1).forEach((csvRow) => {
        const rowData: any = {};
        Object.entries(headers).forEach(([col, field]) => {
          rowData[field] = csvRow[Number(col) - 1];
        });
        if (rowData.studentId) rows.push(rowData);
      });

      return { rows, headers };
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new ConflictException('Empty Excel sheet');

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const mapped = this.mapStudentImportHeader(cell.value);
      if (mapped) headers[colNumber] = mapped;
    });

    const headerEntries = Object.entries(headers);
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData: any = {};
      headerEntries.forEach(([col, field]) => {
        rowData[field] = this.getCellText(row.getCell(Number(col)).value);
      });

      if (rowData.studentId) rows.push(rowData);
    });

    return { rows, headers };
  }

  private parseYearAndSem(val: any, fallback = 1) {
    if (val === undefined || val === null || val === '') return fallback;
    const s = String(val).trim().toUpperCase();
    if (s === 'I') return 1;
    if (s === 'II') return 2;
    if (s === 'III') return 3;
    if (s === 'IV') return 4;
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  private normalizePersonName(value: any) {
    return this.getCellText(value).replace(/\s+/g, ' ').trim();
  }

  private normalizeFacultyKey(value: any) {
    return this.normalizePersonName(value).toLowerCase();
  }

  private isUsableEmail(value: any) {
    const email = this.getCellText(value).toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
  }

  private makeUniqueEmail(
    preferred: string,
    fallbackLocalPart: string,
    domain: string,
    usedEmails: Set<string>,
    currentEmail?: string | null,
  ) {
    const normalizedCurrent = currentEmail?.toLowerCase() || '';
    let candidate = this.isUsableEmail(preferred);
    if (!candidate) {
      candidate = `${fallbackLocalPart}@${domain}`.toLowerCase();
    }
    if (candidate === normalizedCurrent || !usedEmails.has(candidate)) {
      return candidate;
    }

    const safeLocal = fallbackLocalPart.toLowerCase().replace(/[^a-z0-9]/g, '');
    let index = 1;
    do {
      candidate = `${safeLocal}${index}@${domain}`;
      index++;
    } while (usedEmails.has(candidate) && candidate !== normalizedCurrent);
    return candidate;
  }

  private slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  }

  private async ensureFacultyForCounsellor(
    counsellorName: string,
    department: string,
    section: string,
    cache: Map<string, any>,
    usedEmployeeIds: Set<string>,
    usedEmails: Set<string>,
    passwordHash: string,
  ) {
    const key = this.normalizeFacultyKey(counsellorName);
    if (!key) return null;
    const cached = cache.get(key);
    if (cached) return cached;

    let nextNumber = usedEmployeeIds.size + 1;
    let employeeId = '';
    do {
      employeeId = `FAC${String(nextNumber).padStart(4, '0')}`;
      nextNumber++;
    } while (usedEmployeeIds.has(employeeId));
    usedEmployeeIds.add(employeeId);

    const emailLocalPart = this.slugify(counsellorName) || employeeId.toLowerCase();
    const email = this.makeUniqueEmail(
      '',
      emailLocalPart,
      'faculty.vignan.local',
      usedEmails,
    );
    usedEmails.add(email);

    const user = await this.prisma.user.create({
      data: {
        name: counsellorName,
        email,
        password: passwordHash,
        role: 'faculty',
        department: 'CSE',
      },
    });

    const faculty = await this.prisma.faculty.create({
      data: {
        userId: user.id,
        employeeId,
        fullName: counsellorName,
        email,
        department: 'CSE',
        section,
      },
    });

    cache.set(key, faculty);
    return faculty;
  }

  async bulkUpdateFromExcel(file: Express.Multer.File, mode?: string) {
    if (!file) throw new ConflictException('No file uploaded');

    const results = { success: 0, failed: 0, errors: [] as string[] };
    const { rows, headers } = await this.parseStudentImportRows(file);

    // Valid studentId is mandatory
    if (!Object.values(headers).includes('studentId')) {
      throw new ConflictException('Import file missing mandatory "studentId" or "registerno" column');
    }

    const facultyByName = new Map<string, any>();
    const [existingFaculty, existingUsers] = await Promise.all([
      this.prisma.faculty.findMany(),
      this.prisma.user.findMany({ select: { email: true } }),
    ]);
    const usedEmployeeIds = new Set(existingFaculty.map((f) => f.employeeId));
    const usedEmails = new Set(existingUsers.map((u) => u.email.toLowerCase()));
    existingFaculty.forEach((faculty) => {
      facultyByName.set(this.normalizeFacultyKey(faculty.fullName), faculty);
    });
    const defaultPasswordHash = await bcrypt.hash('temp123', 10);

    for (const data of rows) {
      try {
        const studentId = String(data.studentId).trim().toUpperCase();
        const fullName = this.normalizePersonName(data.fullName);
        const section = this.getCellText(data.section) || 'NA';
        const department = this.getCellText(data.department) || 'CSE';
        const program = this.getCellText(data.program) || 'B.Tech';
        const year = this.parseYearAndSem(data.year, 1);
        const semester = this.parseYearAndSem(data.semester, 1);
        const graduationYear =
          graduationYearFromStudentId(studentId) ??
          (data.graduationYear && !isNaN(Number(data.graduationYear))
            ? Number(data.graduationYear)
            : null);
        const cgpa =
          data.cgpa !== undefined && data.cgpa !== null && !isNaN(Number(data.cgpa))
            ? Number(data.cgpa)
            : null;
        const counsellorName = this.normalizePersonName(data.counsellorName);
        let counsellorId = this.getCellText(data.counsellorId);
        let faculty: any = null;

        if (!studentId) {
          results.failed++;
          results.errors.push('Skipped row with missing registration number.');
          continue;
        }

        if (!/^\d{3}[A-Z]{2}[A-Z0-9]{5}$/.test(studentId)) {
          results.failed++;
          results.errors.push(`Row for ${studentId} skipped: Invalid registration number format.`);
          continue;
        }

        if (counsellorName && !counsellorId) {
          faculty = await this.ensureFacultyForCounsellor(
            counsellorName,
            department,
            section,
            facultyByName,
            usedEmployeeIds,
            usedEmails,
            defaultPasswordHash,
          );
          counsellorId = faculty?.employeeId || '';
        }
        
        const existing = await this.prisma.student.findUnique({
          where: { studentId },
          include: { user: true },
        });
        const email = this.makeUniqueEmail(
          data.email,
          studentId.toLowerCase(),
          'student.vignan.local',
          usedEmails,
          existing?.user.email,
        );

        if (existing) {
          if (mode === 'enroll') {
            results.failed++;
            results.errors.push(`Row for ${studentId} skipped: Student already exists. Enroll mode only allows new records.`);
            continue;
          }
          // Update Existing
          const studentUpdates: any = {};
          if (fullName) studentUpdates.fullName = fullName;
          studentUpdates.department = 'CSE';
          studentUpdates.program = program;
          studentUpdates.year = year;
          studentUpdates.semester = semester;
          studentUpdates.section = section;
          studentUpdates.email = email;
          if (cgpa !== null) studentUpdates.cgpa = cgpa;
          if (graduationYear !== null) studentUpdates.graduationYear = graduationYear;
          if (data.phone) studentUpdates.phone = String(data.phone).trim();
          if (counsellorId) studentUpdates.counsellorId = counsellorId;

          // Sync User
          const userUpdates: any = {};
          if (fullName) userUpdates.name = studentUpdates.fullName;
          userUpdates.email = studentUpdates.email;
          userUpdates.department = 'CSE';
          if (data.password) userUpdates.password = await bcrypt.hash(String(data.password).trim(), 10);

          await this.prisma.$transaction([
            this.prisma.student.update({
              where: { id: existing.id },
              data: studentUpdates,
            }),
            this.prisma.user.update({
              where: { id: existing.userId },
              data: userUpdates,
            }),
          ]);

          await this.autoAssignStudent(existing.id);
          usedEmails.add(email);

          results.success++;
        } else {
          if (mode === 'update') {
            results.failed++;
            results.errors.push(`Row for ${studentId} skipped: Student record not found. Update mode only allows existing records.`);
            continue;
          }

          if (!fullName) {
            results.failed++;
            results.errors.push(`Row for ${studentId} skipped: Missing student name.`);
            continue;
          }

          const password = data.password || 'temp123';
          const hashed = await bcrypt.hash(String(password).trim(), 10);
          
          const user = await this.prisma.user.create({
            data: {
              name: fullName,
              email,
              password: hashed,
              role: 'student',
              department: 'CSE',
            },
          });

          await this.prisma.student.create({
            data: {
              userId: user.id,
              studentId,
              fullName,
              department: 'CSE',
              program,
              year,
              semester,
              email,
              cgpa,
              graduationYear,
              section,
              counsellorId: counsellorId || null,
            },
          });

          await this.autoAssignStudent(studentId, true);
          usedEmails.add(email);

          results.success++;
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Error at Student ${data.studentId}: ${err.message}`);
      }
    }

    (results as any).identifiedHeaders = headers;
    return results;
  }

  async listFaculty() {
    return this.prisma.faculty.findMany({
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { assignments: true } },
      },
    });
  }

  async createFaculty(body: CreateFacultyDto) {
    try {
      const email = String(body.email || '').trim().toLowerCase();
      const employeeId = String(body.employeeId || '').trim().toUpperCase();

      if (!email || !employeeId || !body.fullName || !body.department || !body.section) {
        throw new ConflictException('Missing required fields');
      }

      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new ConflictException('Email already exists');

      const existingFaculty = await this.prisma.faculty.findUnique({ where: { employeeId } });
      if (existingFaculty) throw new ConflictException('Employee ID already exists');

      const password = body.password || 'temp123';
      const hashed = await bcrypt.hash(password, 10);

      const user = await this.prisma.user.create({
        data: {
          name: body.fullName,
          email,
          password: hashed,
          role: 'faculty',
          department: 'CSE',
        },
      });

      const faculty = await this.prisma.faculty.create({
        data: {
          userId: user.id,
          employeeId,
          fullName: body.fullName,
          email,
          department: 'CSE',
          section: body.section,
        },
      });

      await this.autoAssignFacultyToStudents(faculty.id);

      return { faculty };
    } catch (error) {
      console.error('Error creating faculty:', error);
      throw error;
    }
  }

  async deleteFaculty(id: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });
    if (!faculty) throw new NotFoundException('Faculty not found');

    await Promise.all([
      this.prisma.user.delete({ where: { id: faculty.userId } }),
      this.prisma.assignment.deleteMany({ where: { facultyId: faculty.id } }),
      this.prisma.faculty.delete({ where: { id: faculty.id } }),
    ]);

    return { message: 'Faculty removed' };
  }

  async bulkUpdateFacultyFromExcel(file: Express.Multer.File, mode?: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer as any);
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new Error('Excel sheet not found');
    const results = { success: 0, failed: 0, errors: [] as string[] };

    const firstRow = worksheet.getRow(1);
    const headers: Record<string, number> = {};
    firstRow.eachCell((cell, colNumber) => {
      const val = String(cell.value || '').toLowerCase().replace(/\s/g, '');
      if (val.includes('id') || val.includes('employee')) headers['employeeId'] = colNumber;
      if (val.includes('name')) headers['fullName'] = colNumber;
      if (val.includes('email')) headers['email'] = colNumber;
      if (val.includes('dept') || val.includes('department')) headers['department'] = colNumber;
      if (val.includes('section')) headers['section'] = colNumber;
    });

    for (let i = 2; i <= worksheet.rowCount; i++) {
        const row = worksheet.getRow(i);
        const data: any = {};
        Object.keys(headers).forEach(key => {
            data[key] = row.getCell(headers[key]).value;
        });

        if (!data.employeeId) continue;

        try {
            if (mode === 'update') {
                const existing = await this.prisma.faculty.findUnique({
                    where: { employeeId: String(data.employeeId) }
                });
                if (existing) {
                    await this.updateFaculty(existing.id, data);
                    results.success++;
                } else {
                    results.failed++;
                    results.errors.push(`Row ${i} (${data.employeeId}): Faculty not found for update.`);
                }
            } else {
                if (!data.fullName || !data.email) {
                    results.failed++;
                    results.errors.push(`Row ${i}: Missing name/email for enrollment.`);
                    continue;
                }
                await this.createFaculty({
                    ...data,
                    employeeId: String(data.employeeId),
                    password: 'temp123',
                });
                results.success++;
            }
        } catch (err: any) {
            results.failed++;
            results.errors.push(`Row ${i} (${data.employeeId}): ${err.message}`);
        }
    }

    return results;
  }

  async bulkDeleteFaculty(ids: string[]) {
    // Delete linked users too? Or just faculty records?
    // Given the previous setup, we should delete both.
    const faculty = await this.prisma.faculty.findMany({
      where: { id: { in: ids } }
    });
    
    const userIds = faculty.map(f => f.userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.assignment.deleteMany({ where: { facultyId: { in: ids } } });
      await tx.faculty.deleteMany({ where: { id: { in: ids } } });
      await tx.user.deleteMany({ where: { id: { in: userIds } } });
    });
  }

  async autoAssignStudent(studentId: string, isSid = false) {
    console.log('[AutoAssign] Starting for Student:', studentId);
    const student = await this.prisma.student.findUnique({
      where: isSid ? { studentId } : { id: studentId },
    });

    if (!student) {
      console.log('[AutoAssign] Student not found.');
      return;
    }

    // 1. Direct Assignment by Counsellor ID (Priority)
    if (student.counsellorId) {
      console.log('[AutoAssign] Found Counsellor ID:', student.counsellorId);
      const faculty = await this.prisma.faculty.findUnique({
        where: { employeeId: student.counsellorId }
      });

      if (faculty) {
        console.log('[AutoAssign] Mapping to Faculty:', faculty.fullName);
        await this.prisma.assignment.upsert({
          where: { studentId: student.id },
          update: { facultyId: faculty.id },
          create: { studentId: student.id, facultyId: faculty.id }
        });
        return;
      } else {
        console.log('[AutoAssign] Faculty with ID', student.counsellorId, 'not found.');
      }
    }

    // Fallback logic REMOVED. Strictly ID-based only.
    console.log('[AutoAssign] Result: No suitable faculty found (Strict ID Mode).');
  }

  async autoAssignFacultyToStudents(facultyId: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) return;

    // Strictly match students looking for THIS faculty employeeId
    const students = await this.prisma.student.findMany({
      where: {
        counsellorId: faculty.employeeId,
        assignment: null,
      }
    });

    if (students.length === 0) return;

    await this.prisma.assignment.createMany({
       skipDuplicates: true,
       data: students.map(s => ({
         studentId: s.id,
         facultyId: faculty.id,
       }))
    });
  }

  async getAssignments() {
    return this.prisma.assignment.findMany({
      include: {
        student: { select: { fullName: true, studentId: true, department: true, section: true } },
        faculty: { select: { fullName: true, employeeId: true } },
      }
    });
  }

  async reassignStudent(studentId: string, facultyId: string) {
    return this.prisma.assignment.upsert({
      where: { studentId },
      update: { facultyId },
      create: { studentId, facultyId },
    });
  }


  async syncAllAssignments() {
    console.log('[Sync] Starting STRICT global assignment synchronization...');
    
    // 1. CLEANUP: Remove assignments where student.counsellorId DOES NOT match faculty.employeeId
    const currentAssignments = await this.prisma.assignment.findMany({
      include: {
        student: { select: { counsellorId: true } },
        faculty: { select: { employeeId: true } }
      }
    });

    const toDelete = currentAssignments.filter(a => a.student.counsellorId !== a.faculty.employeeId);
    if (toDelete.length > 0) {
      await this.prisma.assignment.deleteMany({
        where: { id: { in: toDelete.map(a => a.id) } }
      });
      console.log(`[Sync] Purged ${toDelete.length} legacy/mismatched assignments.`);
    }

    // 2. RE-SYNC: Find unassigned students with a valid counsellorId
    const unassignedWithId = await this.prisma.student.findMany({
      where: {
        assignment: null,
        counsellorId: { not: null }
      }
    });

    let count = 0;
    for (const student of unassignedWithId) {
       const faculty = await this.prisma.faculty.findUnique({
         where: { employeeId: student.counsellorId as string }
       });
       if (faculty) {
         await this.prisma.assignment.create({
           data: { studentId: student.id, facultyId: faculty.id }
         });
         count++;
       }
    }

    console.log(`[Sync] Created ${count} strict ID-based assignments.`);
    return { success: true, purged: toDelete.length, created: count };
  }

  async updateFaculty(id: string, data: any) {
    console.log('[UpdateFaculty] ID:', id, 'Data:', data);
    const faculty = await this.prisma.faculty.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!faculty) throw new Error('Faculty not found');

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Update User record
      await tx.user.update({
        where: { id: faculty.userId },
        data: {
          name: data.fullName || undefined,
          email: data.email || undefined,
          department: 'CSE',
        },
      });

      // 2. Update Faculty record
      const updated = await tx.faculty.update({
        where: { id },
        data: {
          fullName: data.fullName || undefined,
          email: data.email || undefined,
          employeeId: data.employeeId || undefined,
          department: 'CSE',
          section: data.section || undefined,
        },
      });

      return updated;
    });

    // 3. Re-trigger auto-assignment if department/section changed
    if (data.department || data.section) {
      console.log('[UpdateFaculty] Dept/Section changed. Syncing...');
      await this.autoAssignFacultyToStudents(id);
    }

    return result;
  }
}

