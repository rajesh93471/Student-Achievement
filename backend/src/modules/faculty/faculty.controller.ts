import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { Response } from 'express';

@Controller('faculty')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.facultyService.getFacultyProfile(req.user.id);
  }

  @Get('students')
  getStudents(@Req() req: any) {
    return this.facultyService.getAssignedStudents(req.user.id);
  }

  @Get('achievements')
  getAchievements(@Req() req: any, @Query() query: any) {
    return this.facultyService.getAssignedAchievements(req.user.id, query);
  }

  @Get('documents')
  getDocuments(@Req() req: any, @Query() query: any) {
    return this.facultyService.getAssignedDocuments(req.user.id, query);
  }

  @Get('reports/export')
  exportReport(@Req() req: any, @Query() query: any, @Res() res: Response) {
    return this.facultyService.exportReport(req.user.id, query, res);
  }

  @Put('achievements/:id/review')
  reviewAchievement(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: string; remarks?: string },
  ) {
    return this.facultyService.reviewAchievement(req.user.id, id, body);
  }
}
