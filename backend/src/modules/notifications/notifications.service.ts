import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(user: any, body: any) {
    const sender = await this.prisma.user.findUnique({ where: { id: user.id } });
    const notification = await this.prisma.notification.create({
      data: {
        senderId: user.id,
        senderName: sender?.name,
        senderEmail: sender?.email,
        senderRole: sender?.role,
        message: body.message,
      },
    });
    return { notification };
  }

  async getNotifications() {
    const notifications = await this.prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
    return { notifications };
  }

  async markNotificationRead(id: string) {
    const notification = await this.prisma.notification.update({
      where: { id },
      data: { status: "read" },
    });
    if (!notification) throw new NotFoundException("Notification not found");
    return { notification };
  }

  async deleteNotification(id: string) {
    const notification = await this.prisma.notification.delete({ where: { id } });
    if (!notification) throw new NotFoundException("Notification not found");
    return { message: "Notification deleted" };
  }
}
