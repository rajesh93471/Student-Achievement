import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import type { Response } from "express";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get("insights")
  getAnalyticsInsights() {
    return this.adminService.getAnalyticsInsights();
  }

  @Get("reports")
  getReports(@Query() query: any) {
    return this.adminService.getReports(query);
  }

  @Get("reports/export")
  exportReport(@Query() query: any, @Res() res: Response) {
    return this.adminService.exportReport(query, res);
  }

  @Get("meta")
  getMeta() {
    return this.adminService.getMeta();
  }

  @Post("students")
  createStudent(@Body() body: any) {
    return this.adminService.createStudent(body);
  }

  @Post("students/bulk")
  bulkCreateStudents(@Body() body: any) {
    return this.adminService.bulkCreateStudents(body);
  }

  @Put("students/bulk")
  bulkUpdateStudents(@Body() body: any) {
    return this.adminService.bulkUpdateStudents(body);
  }

  @Delete("students/:id")
  deleteStudent(@Param("id") id: string) {
    return this.adminService.deleteStudent(id);
  }
}
