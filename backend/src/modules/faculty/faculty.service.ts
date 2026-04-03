import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  async getFacultyStudents(user: any) {
    const students = await this.prisma.student.findMany({
      where: { department: user.department },
      orderBy: { fullName: 'asc' },
    });
    return { students };
  }

  async getFacultyQueue(user: any) {
    const achievements = await this.prisma.achievement.findMany({
      where: { status: 'pending', student: { department: user.department } },
      include: { student: { select: { fullName: true, studentId: true } } },
    });
    return { achievements };
  }
}
