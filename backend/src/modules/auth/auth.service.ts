import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../common/prisma/prisma.service";
import { LoginDto, RegisterParentDto, RegisterStudentDto } from "./dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  private async signToken(id: string, role: string) {
    return this.jwtService.signAsync({ id, role });
  }

  async registerStudent(payload: RegisterStudentDto) {
    payload.studentId = payload.studentId.trim().toUpperCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existingUser) throw new ConflictException("Email already exists");

    const existingStudent = await this.prisma.student.findUnique({ where: { studentId: payload.studentId } });
    if (existingStudent) throw new ConflictException("Registration number already exists");

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
      name: payload.name,
      email: payload.email,
      password: hashed,
      role: "student",
      department: payload.department,
      },
    });

    const student = await this.prisma.student.create({
      data: {
      userId: user.id,
      studentId: payload.studentId,
      fullName: payload.name,
      department: payload.department,
      program: payload.program,
      admissionCategory: payload.admissionCategory,
      year: payload.year,
      semester: payload.semester,
      graduationYear: payload.graduationYear,
      email: payload.email,
      phone: payload.phone,
      },
    });

    return {
      token: await this.signToken(String(user.id), user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: student.studentId,
      },
    };
  }

  async registerParent(payload: RegisterParentDto) {
    payload.studentId = payload.studentId.trim().toUpperCase();
    const existingUser = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (existingUser) throw new ConflictException("Email already exists");

    const student = await this.prisma.student.findUnique({ where: { studentId: payload.studentId } });
    if (!student) throw new NotFoundException("Registration number not found");

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
      name: payload.name,
      email: payload.email,
      password: hashed,
      role: "parent",
      },
    });

    await this.prisma.parentProfile.create({
      data: {
      userId: user.id,
      studentDbId: student.id,
      studentId: student.studentId,
      relation: payload.relation,
      phone: payload.phone,
      },
    });

    return {
      token: await this.signToken(String(user.id), user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        linkedStudentId: student.studentId,
      },
    };
  }

  async login(payload: LoginDto) {
    const normalizedIdentifier = String(payload.identifier || "").trim();
    let user: Awaited<ReturnType<typeof this.prisma.user.findUnique>> = null;

    if (payload.role === "student") {
      const student = await this.prisma.student.findUnique({
        where: { studentId: normalizedIdentifier.toUpperCase() },
      });
      if (student) {
        user = await this.prisma.user.findUnique({ where: { id: student.userId } });
      }
    } else {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedIdentifier.toLowerCase() },
      });
    }

    if (!user || !(await bcrypt.compare(payload.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const student =
      user.role === "student" ? await this.prisma.student.findUnique({ where: { userId: user.id } }) : null;
    const parent =
      user.role === "parent" ? await this.prisma.parentProfile.findUnique({ where: { userId: user.id } }) : null;

    return {
      token: await this.signToken(String(user.id), user.role),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: student?.studentId,
        linkedStudentId: parent?.studentId,
      },
    };
  }

  async me(user: any) {
    const student =
      user.role === "student" ? await this.prisma.student.findUnique({ where: { userId: user.id } }) : null;
    const parent =
      user.role === "parent" ? await this.prisma.parentProfile.findUnique({ where: { userId: user.id } }) : null;
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        studentId: student?.studentId,
        linkedStudentId: parent?.studentId,
      },
    };
  }
}
