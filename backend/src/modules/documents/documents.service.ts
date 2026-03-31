import { BadRequestException, ForbiddenException, NotFoundException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { createDownloadUrl, createUploadUrl } from "../../utils/s3";

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png"];

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async createDocumentUpload(user: any, body: any) {
    const { fileName, contentType } = body;
    if (!fileName || !contentType || !allowedMimeTypes.includes(contentType)) {
      throw new BadRequestException("Unsupported file type");
    }
    const key = `students/${user.id}/${Date.now()}-${fileName}`;
    return createUploadUrl({ key, contentType });
  }

  async listDocuments(user: any) {
    const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) throw new NotFoundException("Student profile not found");
    const documents = await this.prisma.document.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
    });
    return { documents };
  }

  async saveDocument(user: any, body: any) {
    const student = await this.prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) throw new NotFoundException("Student profile not found");
    const document = await this.prisma.document.create({ data: { studentId: student.id, ...body } });
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
    if (!document) throw new NotFoundException("Document not found");
    const ownerId = (document.student as any)?.userId;
    if (user.role === "student" && String(ownerId) !== String(user.id)) {
      throw new ForbiddenException("Forbidden");
    }
    await this.prisma.document.delete({ where: { id } });
    await this.prisma.student.update({
      where: { id: document.studentId },
      data: { documentsCount: { decrement: 1 } },
    });
    return { message: "Document deleted" };
  }

  async getDocumentDownloadUrl(user: any, id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: { student: true },
    });
    if (!document) throw new NotFoundException("Document not found");

    const ownerId = (document.student as any)?.userId;
    if (user.role === "student" && String(ownerId) !== String(user.id)) {
      throw new ForbiddenException("Forbidden");
    }

    if (user.role === "parent") {
      const parent = await this.prisma.parentProfile.findUnique({ where: { userId: user.id } });
      if (!parent || String(parent.studentDbId) !== String(document.studentId)) {
        throw new ForbiddenException("Forbidden");
      }
    }

    const payload = await createDownloadUrl({ key: document.fileKey });
    return { downloadUrl: payload.downloadUrl, mock: payload.mock };
  }
}
