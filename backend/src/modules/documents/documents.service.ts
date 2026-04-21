import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { createDownloadUrl, createUploadUrl, saveLocalFile } from '../../utils/storage';

const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

const buildSafeStorageKey = (userId: string, fileName: string) => {
  const trimmedFileName = String(fileName || '').trim();
  const extensionMatch = trimmedFileName.match(/(\.[a-zA-Z0-9]+)$/);
  const extension = extensionMatch ? extensionMatch[1].toLowerCase() : '';
  const baseName = extension
    ? trimmedFileName.slice(0, -extension.length)
    : trimmedFileName;
  const safeBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'file';

  return `students/${userId}/${Date.now()}-${safeBaseName}${extension}`;
};

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createDocumentUpload(user: any, body: any) {
    const { fileName, contentType } = body;
    if (!fileName || !contentType || !allowedMimeTypes.includes(contentType)) {
      throw new BadRequestException('Unsupported file type');
    }
    const key = buildSafeStorageKey(user.id, fileName);
    return createUploadUrl({ key, contentType });
  }

  async listDocuments(user: any, query: any = {}) {
    const criteria: any = {};

    if (user.role === 'admin' || user.role === 'faculty') {
      if (query.department) criteria.student = { department: query.department };
      if (query.graduationYear) {
        criteria.student = {
          ...(criteria.student || {}),
          graduationYear: Number(query.graduationYear),
        };
      }
    } else {
      const student = await this.prisma.student.findUnique({
        where: { userId: user.id },
      });
      if (!student) throw new NotFoundException('Student profile not found');
      criteria.studentId = student.id;
    }

    if (query.type) criteria.type = query.type;

    const documents = await this.prisma.document.findMany({
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
      orderBy: { createdAt: 'desc' },
    });

    const hydratedDocuments = await Promise.all(
      documents.map(async (doc) => {
        if (doc.fileUrl || !doc.fileKey) return doc;
        try {
          const payload = await createDownloadUrl({ key: doc.fileKey });
          return { ...doc, fileUrl: payload.downloadUrl };
        } catch {
          return doc;
        }
      }),
    );

    return { documents: hydratedDocuments };
  }

  async saveDocument(user: any, body: any) {
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    const document = await this.prisma.document.create({
      data: { studentId: student.id, ...body },
    });
    await this.prisma.student.update({
      where: { id: student.id },
      data: { documentsCount: { increment: 1 } },
    });
    return { document };
  }

  async deleteDocument(user: any, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!document) throw new NotFoundException('Document not found');
    const ownerId = (document.student as any)?.userId;
    if (user.role === 'student' && String(ownerId) !== String(user.id)) {
      throw new ForbiddenException('Forbidden');
    }
    await this.prisma.document.delete({ where: { id } });
    await this.prisma.student.update({
      where: { id: document.studentId },
      data: { documentsCount: { decrement: 1 } },
    });
    return { message: 'Document deleted' };
  }

  async getDocumentDownloadUrl(user: any, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!document) throw new NotFoundException('Document not found');

    const ownerId = (document.student as any)?.userId;
    if (user.role === 'student' && String(ownerId) !== String(user.id)) {
      throw new ForbiddenException('Forbidden');
    }



    const payload = await createDownloadUrl({ key: document.fileKey });
    return { downloadUrl: payload.downloadUrl, mock: payload.mock };
  }

  async handleLocalUpload(user: any, file: Express.Multer.File, key: string) {
    if (!file) throw new BadRequestException('No file provided');
    saveLocalFile(file, key);
    return { message: 'File uploaded successfully', key };
  }
}
