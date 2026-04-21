import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { Response } from 'express';
import {
  generateAchievementsZip,
  generateDocumentsZip,
  generateExcelReport,
  generateStudentAchievementsPdf,
  generateStudentDocumentsPdf,
} from '../admin/report.service';

const TECHNICAL_CATEGORIES = [
  'hackathon',
  'competition',
  'olympiad',
  'certification',
  'internship',
  'project',
  'research',
  'academic',
] as const;

const NON_TECHNICAL_CATEGORIES = [
  'sports',
  'cultural',
  'club',
  'leadership',
  'volunteering',
  'social-service',
  'nss',
  'ncc',
  'entrepreneurship',
  'arts',
  'literary',
  'public-speaking',
  'community',
  'other-non-technical',
] as const;

const formatAcademicYearLabel = (value?: string | null) => {
  if (!value) return '-';
  return value
    .split('-')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' - ');
};

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  async getFacultyProfile(userId: string) {
    const faculty = await this.prisma.faculty.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, name: true } },
        _count: { select: { assignments: true } },
      },
    });
    if (!faculty) throw new NotFoundException('Faculty profile not found');
    return faculty;
  }

  async getAssignedStudents(userId: string) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    const assignments = await this.prisma.assignment.findMany({
      where: { facultyId: faculty.id },
      include: {
        student: {
          select: {
            id: true,
            studentId: true,
            fullName: true,
            department: true,
            section: true,
            graduationYear: true,
            cgpa: true,
            achievementsCount: true,
          },
        },
      },
    });

    return assignments.map((a) => a.student);
  }

  async getAssignedAchievements(userId: string, query: any = {}) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    const where: any = {
      student: {
        assignment: {
          facultyId: faculty.id,
        },
      },
    };

    if (query.status) where.status = query.status;
    if (query.category && query.category !== 'all') where.category = query.category;
    if (query.year && query.year !== 'all') {
      where.student = { ...where.student, graduationYear: Number(query.year) };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { student: { fullName: { contains: query.search } } },
        { student: { studentId: { contains: query.search } } },
      ];
    }

    const achievements = await this.prisma.achievement.findMany({
      where,
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true,
            department: true,
            section: true,
            graduationYear: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return achievements;
  }

  async getAssignedDocuments(userId: string, query: any = {}) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    const where: any = {
      student: {
        assignment: {
          facultyId: faculty.id,
        },
      },
    };

    if (query.year && query.year !== 'all') {
      where.student = { ...where.student, graduationYear: Number(query.year) };
    }
    if (query.type && query.type !== 'all') where.type = query.type;

    const documents = await this.prisma.document.findMany({
      where,
      include: {
        student: {
          select: {
            fullName: true,
            studentId: true,
            department: true,
            section: true,
            graduationYear: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  }

  async exportReport(userId: string, query: any, res: Response) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    const format = query.format || 'pdf';
    const report = query.report || 'student-achievements';

    if (report === 'student-achievements') {
      const selectedAchievementYear = query.achievementYear;
      const selectedGroup = query.group;
      const selectedCategory = query.category;
      const studentSearch = String(query.student || '').trim();
      const where: any = {
        student: {
          assignment: {
            facultyId: faculty.id,
          },
        },
      };

      if (selectedCategory && selectedCategory !== 'all') {
        where.category = selectedCategory;
      } else if (selectedGroup === 'technical') {
        where.category = { in: TECHNICAL_CATEGORIES };
      } else if (selectedGroup === 'non-technical') {
        where.category = { in: NON_TECHNICAL_CATEGORIES };
      }

      if (studentSearch) {
        where.student = {
          ...(where.student || {}),
          OR: [
            { fullName: { contains: studentSearch } },
            { studentId: { contains: studentSearch } },
          ],
        };
      }

      if (selectedAchievementYear && selectedAchievementYear !== 'all') {
        where.date = {
          gte: new Date(`${selectedAchievementYear}-01-01T00:00:00.000Z`),
          lt: new Date(
            `${Number(selectedAchievementYear) + 1}-01-01T00:00:00.000Z`,
          ),
        };
      }

      const achievements = await this.prisma.achievement.findMany({
        where,
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
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      });

      const titleParts = [
        'Faculty Student Achievements Report',
        selectedAchievementYear && selectedAchievementYear !== 'all'
          ? `Achievement Year ${selectedAchievementYear}`
          : 'All Achievement Years',
        selectedCategory && selectedCategory !== 'all'
          ? `Category ${selectedCategory}`
          : selectedGroup
            ? `${selectedGroup} stream`
            : '',
        studentSearch ? `Student ${studentSearch}` : '',
      ].filter(Boolean);

      if (format === 'zip') {
        const archive = await generateAchievementsZip(achievements);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="faculty-student-achievements.zip"',
        );
        archive.pipe(res);
        return;
      }

      if (format === 'excel') {
        const rows = achievements.map((item) => ({
          'Student Name': item.student?.fullName || 'Student',
          'Registration Number': item.student?.studentId || '-',
          Department: item.student?.department || '-',
          Section: item.student?.section || '-',
          'Graduation Year':
            item.student?.graduationYear != null
              ? String(item.student.graduationYear)
              : '-',
          'Achievement Stream': TECHNICAL_CATEGORIES.includes(
            item.category as (typeof TECHNICAL_CATEGORIES)[number],
          )
            ? 'Technical'
            : 'Non-technical',
          Category: item.category || '-',
          Title: item.title || '-',
          Description: item.description || '-',
          'Date of Achievement': item.date
            ? new Date(item.date).toLocaleDateString('en-CA')
            : '-',
          'Academic Year': formatAcademicYearLabel(item.academicYear),
          Semester: item.semester != null ? String(item.semester) : '-',
          'Activity Type': item.activityType || '-',
          'Organized By': item.organizedBy || '-',
          Position: item.position || '-',
          Status: item.status || '-',
          'Certificate Link': item.certificateUrl || '-',
        }));

        const buffer = await generateExcelReport({
          sheetName: 'Faculty Achievements',
          columns: [
            { header: 'Student Name', key: 'Student Name', width: 24 },
            {
              header: 'Registration Number',
              key: 'Registration Number',
              width: 22,
            },
            { header: 'Department', key: 'Department', width: 18 },
            { header: 'Section', key: 'Section', width: 12 },
            { header: 'Graduation Year', key: 'Graduation Year', width: 16 },
            {
              header: 'Achievement Stream',
              key: 'Achievement Stream',
              width: 18,
            },
            { header: 'Category', key: 'Category', width: 18 },
            { header: 'Title', key: 'Title', width: 28 },
            { header: 'Description', key: 'Description', width: 40 },
            {
              header: 'Date of Achievement',
              key: 'Date of Achievement',
              width: 18,
            },
            { header: 'Academic Year', key: 'Academic Year', width: 16 },
            { header: 'Semester', key: 'Semester', width: 12 },
            { header: 'Activity Type', key: 'Activity Type', width: 18 },
            { header: 'Organized By', key: 'Organized By', width: 18 },
            { header: 'Position', key: 'Position', width: 18 },
            { header: 'Status', key: 'Status', width: 14 },
            { header: 'Certificate Link', key: 'Certificate Link', width: 48 },
          ],
          rows,
        });
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=faculty-student-achievements.xlsx',
        );
        return res.send(buffer);
      }

      const buffer = await generateStudentAchievementsPdf({
        title: titleParts.join(' - '),
        achievements,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=faculty-student-achievements.pdf',
      );
      return res.send(buffer);
    }

    if (report === 'student-documents') {
      const selectedType = query.type;
      const studentSearch = String(query.student || '').trim();
      const where: any = {
        student: {
          assignment: {
            facultyId: faculty.id,
          },
        },
      };

      if (selectedType && selectedType !== 'all') {
        where.type = selectedType;
      }

      if (studentSearch) {
        where.student = {
          ...(where.student || {}),
          OR: [
            { fullName: { contains: studentSearch } },
            { studentId: { contains: studentSearch } },
          ],
        };
      }

      const documents = await this.prisma.document.findMany({
        where,
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
        orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
      });

      const titleParts = [
        'Faculty Student Documents Report',
        selectedType && selectedType !== 'all' ? `Type ${selectedType}` : 'All Types',
        studentSearch ? `Student ${studentSearch}` : '',
      ].filter(Boolean);

      if (format === 'zip') {
        const archive = await generateDocumentsZip(documents);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename="faculty-student-documents.zip"',
        );
        archive.pipe(res);
        return;
      }

      if (format === 'excel') {
        const rows = documents.map((item) => ({
          'Student Name': item.student?.fullName || 'Student',
          'Registration Number': item.student?.studentId || '-',
          Department: item.student?.department || '-',
          Section: item.student?.section || '-',
          'Graduation Year':
            item.student?.graduationYear != null
              ? String(item.student.graduationYear)
              : '-',
          'Document Title': item.title || '-',
          'Document Type': item.type || '-',
          'Mime Type': item.mimeType || '-',
          Size: item.size != null ? String(item.size) : '-',
          'Created At': item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-CA')
            : '-',
          'File Link': item.fileUrl || '-',
        }));

        const buffer = await generateExcelReport({
          sheetName: 'Faculty Documents',
          columns: [
            { header: 'Student Name', key: 'Student Name', width: 24 },
            {
              header: 'Registration Number',
              key: 'Registration Number',
              width: 22,
            },
            { header: 'Department', key: 'Department', width: 18 },
            { header: 'Section', key: 'Section', width: 12 },
            { header: 'Graduation Year', key: 'Graduation Year', width: 16 },
            { header: 'Document Title', key: 'Document Title', width: 28 },
            { header: 'Document Type', key: 'Document Type', width: 18 },
            { header: 'Mime Type', key: 'Mime Type', width: 20 },
            { header: 'Size', key: 'Size', width: 14 },
            { header: 'Created At', key: 'Created At', width: 16 },
            { header: 'File Link', key: 'File Link', width: 48 },
          ],
          rows,
        });
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=faculty-student-documents.xlsx',
        );
        return res.send(buffer);
      }

      const buffer = await generateStudentDocumentsPdf({
        title: titleParts.join(' - '),
        documents,
      });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=faculty-student-documents.pdf',
      );
      return res.send(buffer);
    }

    throw new ForbiddenException('Unsupported report');
  }

  async reviewAchievement(userId: string, achievementId: string, body: { status: string; remarks?: string }) {
    const faculty = await this.prisma.faculty.findUnique({ where: { userId } });
    if (!faculty) throw new NotFoundException('Faculty profile not found');

    const achievement = await this.prisma.achievement.findUnique({
      where: { id: achievementId },
      include: { student: { include: { assignment: true } } },
    });

    if (!achievement) throw new NotFoundException('Achievement not found');
    if (achievement.student.assignment?.facultyId !== faculty.id) {
      throw new ForbiddenException('You are not assigned to this student');
    }

    return this.prisma.achievement.update({
      where: { id: achievementId },
      data: {
        facultyStatus: body.status, // "Reviewed", "Recommended"
        facultyRemarks: body.remarks,
      },
    });
  }
}
