import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('insights')
  getAnalyticsInsights() {
    return this.adminService.getAnalyticsInsights();
  }

  @Get('reports')
  getReports(@Query() query: any) {
    return this.adminService.getReports(query);
  }

  @Get('reports/export')
  exportReport(@Query() query: any, @Res() res: Response) {
    return this.adminService.exportReport(query, res);
  }

  @Get('meta')
  getMeta() {
    return this.adminService.getMeta();
  }

  @Post('students')
  createStudent(@Body() body: CreateStudentDto) {
    return this.adminService.createStudent(body);
  }

  @Post('students/bulk')
  bulkCreateStudents(@Body() body: any) {
    return this.adminService.bulkCreateStudents(body);
  }

  @Put('students/bulk')
  bulkUpdateStudents(@Body() body: any) {
    return this.adminService.bulkUpdateStudents(body);
  }

  @Post('students/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadStudents(
    @UploadedFile() file: Express.Multer.File,
    @Query('mode') mode?: string,
  ) {
    return this.adminService.bulkUpdateFromExcel(file, mode);
  }

  @Delete('students/:id')
  deleteStudent(@Param('id') id: string) {
    return this.adminService.deleteStudent(id);
  }

  @Post('students/bulk-delete')
  bulkDeleteStudents(@Body('ids') ids: string[]) {
    return this.adminService.bulkDeleteStudents(ids);
  }

  @Get('faculty')
  listFaculty() {
    return this.adminService.listFaculty();
  }

  @Post('faculty')
  createFaculty(@Body() body: CreateFacultyDto) {
    return this.adminService.createFaculty(body);
  }

  @Delete('faculty/:id')
  deleteFaculty(@Param('id') id: string) {
    return this.adminService.deleteFaculty(id);
  }

  @Put('faculty/:id')
  updateFaculty(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateFaculty(id, body);
  }

  @Post('faculty/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFaculty(
    @UploadedFile() file: Express.Multer.File,
    @Query('mode') mode?: string,
  ) {
    return this.adminService.bulkUpdateFacultyFromExcel(file, mode);
  }

  @Post('faculty/bulk-delete')
  bulkDeleteFaculty(@Body('ids') ids: string[]) {
    return this.adminService.bulkDeleteFaculty(ids);
  }

  @Get('assignments')
  getAssignments() {
    return this.adminService.getAssignments();
  }

  @Put('assignments')
  reassignStudent(@Body() body: { studentId: string; facultyId: string }) {
    return this.adminService.reassignStudent(body.studentId, body.facultyId);
  }

  @Post('assignments/sync')
  syncAssignments() {
    return this.adminService.syncAllAssignments();
  }
}
