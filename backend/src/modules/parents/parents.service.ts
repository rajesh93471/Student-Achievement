import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { createDownloadUrl } from '../../utils/s3';

@Injectable()
export class ParentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getParentDashboard(user: any) {
    const parent = await this.prisma.parentProfile.findUnique({
      where: { userId: user.id },
    });
    if (!parent) throw new NotFoundException('Parent profile not found');

    const [student, achievementsRaw, documents] = await Promise.all([
      this.prisma.student.findUnique({ where: { id: parent.studentDbId } }),
      this.prisma.achievement.findMany({
        where: { studentId: parent.studentDbId },
        orderBy: { date: 'desc' },
      }),
      this.prisma.document.findMany({
        where: { studentId: parent.studentDbId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const achievements = await Promise.all(
      achievementsRaw.map(async (ach) => {
        if (!ach.certificateKey || ach.certificateUrl) return ach;
        try {
          const { downloadUrl } = await createDownloadUrl({
            key: ach.certificateKey,
          });
          return { ...ach, certificateUrl: downloadUrl };
        } catch {
          return ach;
        }
      }),
    );

    return { parent, student, achievements, documents };
  }
}
