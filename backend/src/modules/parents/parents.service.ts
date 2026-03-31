import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class ParentsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async getParentDashboard(user: any) {
    const parent = await this.prisma.parentProfile.findUnique({ where: { userId: user.id } });
    if (!parent) throw new NotFoundException("Parent profile not found");

    const [student, achievements, documents] = await Promise.all([
      this.prisma.student.findUnique({ where: { id: parent.studentDbId } }),
      this.prisma.achievement.findMany({ where: { studentId: parent.studentDbId }, orderBy: { date: "desc" } }),
      this.prisma.document.findMany({ where: { studentId: parent.studentDbId }, orderBy: { createdAt: "desc" } }),
    ]);

    return { parent, student, achievements, documents };
  }
}
