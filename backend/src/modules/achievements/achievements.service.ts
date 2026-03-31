import { ForbiddenException, NotFoundException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class AchievementsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  private async getScopedStudent(user: any) {
    if (user.role !== "student") return null;
    return this.prisma.student.findUnique({ where: { userId: user.id } });
  }

  async listAchievements(user: any, query: any) {
    const criteria: any = {};
    if (user.role === "student") {
      const student = await this.getScopedStudent(user);
      if (!student) throw new NotFoundException("Student profile not found");
      criteria.studentId = student.id;
    }
    if (user.role === "faculty") {
      criteria.student = { department: user.department };
    }
    if (user.role === "admin" && query.department) {
      criteria.student = { department: query.department };
    }
    if (query.category) criteria.category = query.category;
    if (query.academicYear) criteria.academicYear = query.academicYear;
    if (query.semester) criteria.semester = Number(query.semester);
    if (query.status) criteria.status = query.status;

    const achievements = await this.prisma.achievement.findMany({
      where: criteria,
      include: { student: { select: { fullName: true, studentId: true, department: true, graduationYear: true } } },
    });
    return { achievements };
  }

  async createAchievement(user: any, body: any) {
    const student = await this.getScopedStudent(user);
    if (!student) throw new NotFoundException("Student profile not found");

    const academicYear = body.academicYear || (student.year ? `Year ${student.year}` : undefined);
    const semester = body.semester ?? student.semester;

    const achievement = await this.prisma.achievement.create({
      data: {
        studentId: student.id,
        ...body,
        academicYear,
        semester,
        date: body.date ? new Date(body.date) : new Date(),
      },
    });
    await this.prisma.student.update({
      where: { id: student.id },
      data: { achievementsCount: { increment: 1 } },
    });
    return { achievement };
  }

  async updateAchievement(user: any, id: string, body: any) {
    const achievement = await this.prisma.achievement.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!achievement) throw new NotFoundException("Achievement not found");
    const ownerId = (achievement.student as any)?.userId;
    if (user.role === "student" && String(ownerId) !== String(user.id)) {
      throw new ForbiddenException("Forbidden");
    }
    const updateData = {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
      status: "pending",
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
    if (!achievement) throw new NotFoundException("Achievement not found");
    const ownerId = (achievement.student as any)?.userId;
    if (user.role === "student" && String(ownerId) !== String(user.id)) {
      throw new ForbiddenException("Forbidden");
    }
    await this.prisma.achievement.delete({ where: { id } });
    await this.prisma.student.update({
      where: { id: achievement.studentId },
      data: { achievementsCount: { decrement: 1 } },
    });
    return { message: "Achievement deleted" };
  }

  async reviewAchievement(user: any, id: string, body: any) {
    const achievement = await this.prisma.achievement.findUnique({ where: { id } });
    if (!achievement) throw new NotFoundException("Achievement not found");
    const updated = await this.prisma.achievement.update({
      where: { id },
      data: {
        status: body.status,
        feedback: body.feedback,
        recommendedForAward: body.recommendedForAward || false,
        verifiedById: user.id,
      },
    });
    return { achievement: updated };
  }
}
