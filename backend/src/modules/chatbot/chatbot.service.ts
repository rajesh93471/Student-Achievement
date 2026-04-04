import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChatbotService {
  constructor(private readonly prisma: PrismaService) {}

  private async buildLiveData(user: any) {
    if (!user) return { scope: 'unknown', note: 'No user context found.' };

    if (user.role === 'admin') {
      const [
        totalStudents,
        totalAchievements,
        totalDocuments,

        unreadNotifications,
        departmentStats,
        categoryStats,
        yearStats,
        recentAchievements,
      ] = await Promise.all([
        this.prisma.student.count(),
        this.prisma.achievement.count(),
        this.prisma.document.count(),

        this.prisma.notification.count({ where: { status: 'unread' } }),
        this.prisma.student.groupBy({
          by: ['department'],
          _count: { _all: true },
        }),
        this.prisma.achievement.groupBy({
          by: ['category'],
          _count: { _all: true },
        }),
        this.prisma.achievement.groupBy({
          by: ['academicYear'],
          _count: { _all: true },
        }),
        this.prisma.achievement.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            student: {
              select: { fullName: true, studentId: true, department: true },
            },
          },
        }),
      ]);

      return {
        scope: 'admin',
        totals: {
          students: totalStudents,
          achievements: totalAchievements,
          documents: totalDocuments,

        },
        notifications: { unread: unreadNotifications },
        departmentBreakdown: departmentStats.map((row) => ({
          _id: row.department,
          students: row._count._all,
        })),
        achievementCategories: categoryStats.map((row) => ({
          _id: row.category,
          achievements: row._count._all,
        })),
        achievementYears: yearStats.map((row) => ({
          _id: row.academicYear,
          achievements: row._count._all,
        })),
        recentAchievements: recentAchievements.map((item: any) => ({
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

    let student: any = null;
    if (user.role === 'student') {
      student = await this.prisma.student.findUnique({
        where: { userId: user.id },
      });
    }

    if (!student) {
      return { scope: user.role, note: 'No linked student record found.' };
    }

    const [achievements, documents] = await Promise.all([
      this.prisma.achievement.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.document.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
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
      recentAchievements: achievements.map((item: any) => ({
        title: item.title,
        category: item.category,
        status: item.status,
        date: item.date,
      })),
      recentDocuments: documents.map((item: any) => ({
        title: item.title,
        type: item.type,
        createdAt: item.createdAt,
      })),
    };
  }

  async chatWithBot(user: any, body: any) {
    const { message } = body;
    if (!message || message.length < 2) {
      throw new BadRequestException('Message is required.');
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
    if (!geminiKey) {
      return {
        reply:
          'Chatbot is not configured. Add GEMINI_API_KEY in the backend .env.',
      };
    }

    const systemPrompt =
      'You are the university portal assistant. Answer questions about the Student Achievement ' +
      'and Profile Management System using the provided live data. Be concise, accurate, and helpful. ' +
      'If the data is missing, say so. Use totals and counts when asked.';

    const liveData = await this.buildLiveData(user);

    const modelPref = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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
                  { text: `Live data (JSON): ${JSON.stringify(liveData)}` },
                  { text: `User question: ${message}` },
                ],
              },
            ],
            generationConfig: { temperature: 0.3 },
          }),
        },
      );

    const listModels = async () =>
      fetch(
        `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${geminiKey}`,
      );

    const pickSupportedModel = (models: any[] = []) =>
      models
        .find((m: any) =>
          (m.supportedGenerationMethods || []).includes('generateContent'),
        )
        ?.name?.replace('models/', '');

    let aiResponse: any;
    try {
      aiResponse = await callGemini(modelPref);
    } catch (_error) {
      return { reply: 'Chatbot is unavailable right now. Please try again.' };
    }

    if (!aiResponse.ok) {
      try {
        const modelResponse = await listModels();
        if (modelResponse.ok) {
          const modelJson = await modelResponse.json();
          const fallbackModel = pickSupportedModel(modelJson.models || []);
          if (fallbackModel) {
            aiResponse = await callGemini(fallbackModel);
          }
        }
      } catch (_error) {
        return { reply: 'Chatbot is unavailable right now. Please try again.' };
      }
      if (!aiResponse.ok) {
        return { reply: 'Chatbot is unavailable right now. Please try again.' };
      }
    }

    const data = await aiResponse.json();
    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text)
        .join('\n') ||
      'I could not generate a response. Please rephrase your question.';

    return { reply };
  }
}
