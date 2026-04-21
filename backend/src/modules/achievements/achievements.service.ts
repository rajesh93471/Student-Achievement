import {
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { createDownloadUrl } from '../../utils/storage';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  private async syncStudentAchievementCount(studentId: string) {
    const total = await this.prisma.achievement.count({
      where: { studentId },
    });

    await this.prisma.student.update({
      where: { id: studentId },
      data: { achievementsCount: total },
    });
  }

  private async getScopedStudent(user: any) {
    if (user.role !== 'student') return null;
    return this.prisma.student.findUnique({ where: { userId: user.id } });
  }

  async listAchievements(user: any, query: any) {
    const criteria: any = {};
    if (user.role === 'student') {
      const student = await this.getScopedStudent(user);
      if (!student) throw new NotFoundException('Student profile not found');
      criteria.studentId = student.id;
    }
    if (user.role === 'admin' && query.department) {
      criteria.student = { department: query.department };
    }
    if (query.category) criteria.category = query.category;
    if (query.academicYear) criteria.academicYear = query.academicYear;
    if (query.semester) criteria.semester = Number(query.semester);

    const achievements = await this.prisma.achievement.findMany({
      where: criteria,
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
    });
    const hydratedAchievements = await Promise.all(
      achievements.map(async (achievement) => {
        if (achievement.certificateUrl || !achievement.certificateKey) {
          return achievement;
        }

        try {
          const payload = await createDownloadUrl({
            key: achievement.certificateKey,
          });
          return {
            ...achievement,
            certificateUrl: payload.downloadUrl,
          };
        } catch {
          return achievement;
        }
      }),
    );

    return { achievements: hydratedAchievements };
  }

  async createAchievement(user: any, body: any) {
    const student = await this.getScopedStudent(user);
    if (!student) throw new NotFoundException('Student profile not found');

    const academicYear =
      body.academicYear || (student.year ? `Year ${student.year}` : undefined);
    const semester = body.semester ?? student.semester;
    const title = String(body.title || '').trim();
    const category = String(body.category || '').trim();
    const description = String(body.description || '').trim();
    const certificateUrl =
      typeof body.certificateUrl === 'string' ? body.certificateUrl.trim() : '';
    const certificateKey =
      typeof body.certificateKey === 'string' ? body.certificateKey.trim() : '';

    if (!title) {
      throw new NotFoundException('Achievement title is required');
    }
    if (!category) {
      throw new NotFoundException('Achievement category is required');
    }

    const achievement = await this.prisma.achievement.create({
      data: {
        studentId: student.id,
        title,
        description,
        category,
        activityType: body.activityType
          ? String(body.activityType).trim()
          : null,
        organizedBy: body.organizedBy ? String(body.organizedBy).trim() : null,
        position: body.position ? String(body.position).trim() : null,
        // Keep DB-safe values here; listAchievements can hydrate a signed URL from the key when needed.
        certificateUrl:
          certificateUrl && certificateUrl.length <= 180
            ? certificateUrl
            : null,
        certificateKey: certificateKey || null,
        academicYear,
        semester,
        date: body.date ? new Date(body.date) : new Date(),
      },
    });
    await this.syncStudentAchievementCount(student.id);
    return { achievement };
  }

  async updateAchievement(user: any, id: string, body: any) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!achievement) throw new NotFoundException('Achievement not found');
    const ownerId = (achievement.student as any)?.userId;
    if (user.role === 'student' && String(ownerId) !== String(user.id)) {
      throw new ForbiddenException('Forbidden');
    }
    const updateData = {
      title:
        body.title !== undefined ? String(body.title || '').trim() : undefined,
      description:
        body.description !== undefined
          ? String(body.description || '').trim()
          : undefined,
      category:
        body.category !== undefined
          ? String(body.category || '').trim()
          : undefined,
      activityType:
        body.activityType !== undefined
          ? String(body.activityType || '').trim()
          : undefined,
      organizedBy:
        body.organizedBy !== undefined
          ? String(body.organizedBy || '').trim()
          : undefined,
      position:
        body.position !== undefined
          ? String(body.position || '').trim()
          : undefined,
      date: body.date ? new Date(body.date) : undefined,
      academicYear: body.academicYear,
      semester: body.semester,
    };
    const updated = await this.prisma.achievement.update({
      where: { id },
      data: updateData,
    });
    return { achievement: updated };
  }

  async deleteAchievement(user: any, id: string) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!achievement) throw new NotFoundException('Achievement not found');
    const ownerId = (achievement.student as any)?.userId;
    if (user.role === 'student' && String(ownerId) !== String(user.id)) {
      throw new ForbiddenException('Forbidden');
    }
    await this.prisma.achievement.delete({ where: { id } });
    await this.syncStudentAchievementCount(achievement.studentId);
    return { message: 'Achievement deleted' };
  }

}
