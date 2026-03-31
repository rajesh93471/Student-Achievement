import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { FacultyService } from "./faculty.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("faculty")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("faculty")
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get("students")
  getFacultyStudents(@Req() req: any) {
    return this.facultyService.getFacultyStudents(req.user);
  }

  @Get("queue")
  getFacultyQueue(@Req() req: any) {
    return this.facultyService.getFacultyQueue(req.user);
  }
}
