import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles("student")
  create(@Req() req: any, @Body() body: any) {
    return this.notificationsService.createNotification(req.user, body);
  }

  @Get()
  @Roles("admin")
  list() {
    return this.notificationsService.getNotifications();
  }

  @Put(":id/read")
  @Roles("admin")
  markRead(@Param("id") id: string) {
    return this.notificationsService.markNotificationRead(id);
  }

  @Delete(":id")
  @Roles("admin")
  remove(@Param("id") id: string) {
    return this.notificationsService.deleteNotification(id);
  }
}
