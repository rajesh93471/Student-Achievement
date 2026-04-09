import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  private buildStudentQuery(user: any) {
    if (user.role === 'student') {
      return { userId: user.id };
    }
    return {};
  }

  async getMyProfile(user: any) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });
    if (!student) throw new NotFoundException('Student profile not found');

    const [achievements, documents] = await Promise.all([
      this.prisma.achievement.findMany({
        where: { studentId: student.id },
        orderBy: { date: 'desc' },
      }),
      this.prisma.document.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { student, achievements, documents };
  }

  async updateMyProfile(user: any, body: any) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });
    if (!student) throw new NotFoundException('Student profile not found');

    const nextEmail =
      typeof body.email === 'string'
        ? body.email.trim().toLowerCase()
        : undefined;
    const nextAddress =
      typeof body.address === 'string'
        ? body.address.trim()
        : body.address === null
          ? ''
          : undefined;
    const nextYear = body.year !== undefined ? Number(body.year) : undefined;
    const nextSemester =
      body.semester !== undefined ? Number(body.semester) : undefined;
    const nextPhone =
      typeof body.phone === 'string' ? body.phone.trim() : undefined;

    if (nextEmail) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: nextEmail,
          NOT: { id: user.id },
        },
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedStudent = await this.prisma.$transaction(async (tx) => {
      if (nextEmail) {
        await tx.user.update({
          where: { id: user.id },
          data: { email: nextEmail },
        });
      }

      return tx.student.update({
        where: { userId: user.id },
        data: {
          ...(nextEmail ? { email: nextEmail } : {}),
          ...(nextAddress !== undefined
            ? { address: nextAddress || null }
            : {}),
          ...(nextYear !== undefined ? { year: nextYear } : {}),
          ...(nextSemester !== undefined ? { semester: nextSemester } : {}),
          ...(nextPhone !== undefined ? { phone: nextPhone || null } : {}),
        },
      });
    });

    return { student: updatedStudent };
  }

  async listStudents(user: any, query: any) {
    const { search, department, semester, year, category } = query;
    const match: any = { ...this.buildStudentQuery(user) };
    const departmentValue =
      typeof department === 'string' ? department.trim() : '';
    const searchValue = typeof search === 'string' ? search.trim() : '';

    if (departmentValue) {
      match.department = { contains: departmentValue, mode: 'insensitive' };
    }
    if (semester) {
      match.semester = Number(semester);
    }
    if (year) {
      match.year = Number(year);
    }
    if (searchValue) {
      match.OR = [
        { fullName: { contains: searchValue, mode: 'insensitive' } },
        { studentId: { contains: searchValue, mode: 'insensitive' } },
        { department: { contains: searchValue, mode: 'insensitive' } },
      ];
    }
    if (category) {
      match.achievements = { some: { category } };
    }

    const students = await this.prisma.student.findMany({
      where: match,
      orderBy: { createdAt: 'desc' },
    });

    return { students };
  }

  async getStudentById(user: any, id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    if (user.role === 'student' && String(student.userId) !== String(user.id)) {
      throw new ForbiddenException('Forbidden');
    }

    const [achievements, documents] = await Promise.all([
      this.prisma.achievement.findMany({
        where: { studentId: student.id },
        orderBy: { date: 'desc' },
      }),
      this.prisma.document.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { student, achievements, documents };
  }

  async adminUpdateStudent(id: string, body: any) {
    const { year, semester, graduationYear, cgpa, ...rest } = body;
    const updates: any = { ...rest };
    if (year !== undefined) updates.year = Number(year);
    if (semester !== undefined) updates.semester = Number(semester);
    if (graduationYear !== undefined)
      updates.graduationYear = graduationYear ? Number(graduationYear) : null;
    if (cgpa !== undefined) updates.cgpa = cgpa ? Number(cgpa) : null;

    const student = await this.prisma.student.update({
      where: { id },
      data: updates,
    });
    if (!student) throw new NotFoundException('Student not found');
    return { student };
  }
}
