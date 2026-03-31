import { Controller, Get, Param, Put, Query, UseGuards, Req, Body } from "@nestjs/common";
import { StudentsService } from "./students.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("students")
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get("me")
  @Roles("student")
  getMyProfile(@Req() req: any) {
    return this.studentsService.getMyProfile(req.user);
  }

  @Get()
  @Roles("admin", "faculty")
  listStudents(@Req() req: any, @Query() query: any) {
    return this.studentsService.listStudents(req.user, query);
  }

  @Get(":id")
  @Roles("admin", "faculty", "student")
  getStudentById(@Req() req: any, @Param("id") id: string) {
    return this.studentsService.getStudentById(req.user, id);
  }

  @Put(":id")
  @Roles("admin")
  adminUpdateStudent(@Param("id") id: string, @Body() body: any) {
    return this.studentsService.adminUpdateStudent(id, body);
  }
}
