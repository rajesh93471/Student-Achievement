import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, randomInt, createHash } from 'crypto';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto, RegisterParentDto, RegisterStudentDto } from './dto';

@Injectable()
export class AuthService {
  private readonly otpExpiryMinutes = Number(
    process.env.OTP_EXPIRY_MINUTES || 10,
  );
  private readonly resetTokenExpiryMinutes = Number(
    process.env.RESET_TOKEN_EXPIRY_MINUTES || 15,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async signToken(id: string, role: string) {
    return this.jwtService.signAsync({ id, role });
  }

  private normalizeIdentifier(identifier: string) {
    return String(identifier || '').trim();
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async resolveStudentUserByIdentifier(identifier: string) {
    const normalizedIdentifier = this.normalizeIdentifier(identifier);
    if (!normalizedIdentifier) {
      throw new BadRequestException('Registration number or email is required');
    }

    const normalizedEmail = normalizedIdentifier.toLowerCase();
    const normalizedStudentId = normalizedIdentifier.toUpperCase();
    const student = await this.prisma.student.findFirst({
      where: {
        OR: [{ studentId: normalizedStudentId }, { email: normalizedEmail }],
      },
    });

    if (!student) {
      throw new NotFoundException('Student account not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: student.userId },
    });
    if (!user || user.role !== 'student') {
      throw new NotFoundException('Student account not found');
    }

    if (!student.email) {
      throw new BadRequestException(
        'No email is available for this student account',
      );
    }

    return { student, user };
  }

  private async sendPasswordResetOtpEmail(
    email: string,
    studentName: string,
    otp: string,
  ) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure =
      String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const senderName = process.env.SMTP_FROM_NAME || 'Vignan Student Portal';
    const senderEmail = process.env.SMTP_FROM_EMAIL || smtpUser;

    if (!host || !smtpUser || !smtpPass || !senderEmail) {
      throw new InternalServerErrorException(
        'Email delivery is not configured',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: email,
      subject: 'Your Vignan password reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
          <p>Hello ${studentName || 'Student'},</p>
          <p>Use the following OTP to reset your Vignan Student Portal password:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 0.24em; color: #1d4ed8; margin: 18px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in ${this.otpExpiryMinutes} minutes.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
      text: `Hello ${studentName || 'Student'}, your password reset OTP is ${otp}. It expires in ${this.otpExpiryMinutes} minutes.`,
    });
  }

  async registerStudent(payload: RegisterStudentDto) {
    payload.studentId = payload.studentId.trim().toUpperCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) throw new ConflictException('Email already exists');

    const existingStudent = await this.prisma.student.findUnique({
      where: { studentId: payload.studentId },
    });
    if (existingStudent)
      throw new ConflictException('Registration number already exists');

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashed,
        role: 'student',
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
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser) throw new ConflictException('Email already exists');

    const student = await this.prisma.student.findUnique({
      where: { studentId: payload.studentId },
    });
    if (!student) throw new NotFoundException('Registration number not found');

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashed,
        role: 'parent',
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
    const normalizedIdentifier = String(payload.identifier || '').trim();
    let user: Awaited<ReturnType<typeof this.prisma.user.findUnique>> = null;

    if (payload.role === 'student') {
      const student = await this.prisma.student.findUnique({
        where: { studentId: normalizedIdentifier.toUpperCase() },
      });
      if (student) {
        user = await this.prisma.user.findUnique({
          where: { id: student.userId },
        });
      }
    } else {
      user = await this.prisma.user.findUnique({
        where: { email: normalizedIdentifier.toLowerCase() },
      });
    }

    if (!user || !(await bcrypt.compare(payload.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const student =
      user.role === 'student'
        ? await this.prisma.student.findUnique({ where: { userId: user.id } })
        : null;
    const parent =
      user.role === 'parent'
        ? await this.prisma.parentProfile.findUnique({
            where: { userId: user.id },
          })
        : null;

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
      user.role === 'student'
        ? await this.prisma.student.findUnique({ where: { userId: user.id } })
        : null;
    const parent =
      user.role === 'parent'
        ? await this.prisma.parentProfile.findUnique({
            where: { userId: user.id },
          })
        : null;
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

  async requestPasswordResetOtp(body: { identifier: string }) {
    const { student, user } = await this.resolveStudentUserByIdentifier(
      body.identifier,
    );
    const otp = String(randomInt(100000, 1000000));
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + this.otpExpiryMinutes * 60 * 1000);

    await this.prisma.passwordResetOtp.deleteMany({
      where: {
        userId: user.id,
        consumedAt: null,
      },
    });

    await this.prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
      },
    });

    await this.sendPasswordResetOtpEmail(student.email, student.fullName, otp);

    return {
      message: 'OTP sent to your email address',
      email: student.email,
    };
  }

  async verifyPasswordResetOtp(body: { identifier: string; otp: string }) {
    const { user } = await this.resolveStudentUserByIdentifier(body.identifier);
    const otpValue = String(body.otp || '').trim();
    if (!otpValue) {
      throw new BadRequestException('OTP is required');
    }

    const request = await this.prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!request) {
      throw new BadRequestException('Please request a new OTP');
    }

    if (request.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired');
    }

    if (request.attempts >= 5) {
      throw new BadRequestException(
        'Too many invalid OTP attempts. Request a new OTP',
      );
    }

    const isMatch = await bcrypt.compare(otpValue, request.otpHash);
    if (!isMatch) {
      await this.prisma.passwordResetOtp.update({
        where: { id: request.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Invalid OTP');
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = this.hashToken(resetToken);
    const resetTokenExpiresAt = new Date(
      Date.now() + this.resetTokenExpiryMinutes * 60 * 1000,
    );

    await this.prisma.passwordResetOtp.update({
      where: { id: request.id },
      data: {
        verifiedAt: new Date(),
        resetTokenHash,
        resetTokenExpiresAt,
      },
    });

    return {
      message: 'OTP verified successfully',
      resetToken,
    };
  }

  async resetPassword(body: {
    identifier: string;
    resetToken: string;
    password: string;
  }) {
    const { user } = await this.resolveStudentUserByIdentifier(body.identifier);
    const token = String(body.resetToken || '').trim();
    const password = String(body.password || '');

    if (!token) {
      throw new BadRequestException(
        'Reset session is missing. Verify OTP again',
      );
    }
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const request = await this.prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (
      !request ||
      !request.resetTokenHash ||
      !request.verifiedAt ||
      !request.resetTokenExpiresAt
    ) {
      throw new BadRequestException('Reset session has expired. Start again');
    }

    if (request.resetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset session has expired. Start again');
    }

    const tokenHash = this.hashToken(token);
    if (tokenHash !== request.resetTokenHash) {
      throw new BadRequestException('Invalid reset session. Verify OTP again');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetOtp.update({
        where: { id: request.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return { message: 'Password updated successfully' };
  }
}
