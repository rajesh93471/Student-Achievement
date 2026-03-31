import { ForbiddenException, NotFoundException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  private buildStudentQuery(user: any) {
    if (user.role === "student") {
      return { userId: user.id };
    }
    if (user.role === "faculty") {
      return { department: user.department };
    }
    return {};
  }

  async getMyProfile(user: any) {
    const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) throw new NotFoundException("Student profile not found");

    const [achievements, documents] = await Promise.all([
      this.prisma.achievement.findMany({ where: { studentId: student.id }, orderBy: { date: "desc" } }),
      this.prisma.document.findMany({ where: { studentId: student.id }, orderBy: { createdAt: "desc" } }),
    ]);

    return { student, achievements, documents };
  }

  async listStudents(user: any, query: any) {
    const { search, department, semester, year, category } = query;
    const match: any = { ...this.buildStudentQuery(user) };
    const departmentValue = typeof department === "string" ? department.trim() : "";
    const searchValue = typeof search === "string" ? search.trim() : "";

    if (departmentValue) {
      match.department = { contains: departmentValue, mode: "insensitive" };
    }
    if (semester) {
      match.semester = Number(semester);
    }
    if (year) {
      match.year = Number(year);
    }
    if (searchValue) {
      match.OR = [
        { fullName: { contains: searchValue, mode: "insensitive" } },
        { studentId: { contains: searchValue, mode: "insensitive" } },
        { department: { contains: searchValue, mode: "insensitive" } },
      ];
    }
    if (category) {
      match.achievements = { some: { category } };
    }

    const students = await this.prisma.student.findMany({ where: match, orderBy: { createdAt: "desc" } });

    return { students };
  }

  async getStudentById(user: any, id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException("Student not found");

    if (user.role === "student" && String(student.userId) !== String(user.id)) {
      throw new ForbiddenException("Forbidden");
    }
    if (user.role === "faculty" && student.department !== user.department) {
      throw new ForbiddenException("Forbidden");
    }

    const [achievements, documents] = await Promise.all([
      this.prisma.achievement.findMany({ where: { studentId: student.id }, orderBy: { date: "desc" } }),
      this.prisma.document.findMany({ where: { studentId: student.id }, orderBy: { createdAt: "desc" } }),
    ]);

    return { student, achievements, documents };
  }

  async adminUpdateStudent(id: string, body: any) {
    const student = await this.prisma.student.update({ where: { id }, data: body });
    if (!student) throw new NotFoundException("Student not found");
    return { student };
  }
}
