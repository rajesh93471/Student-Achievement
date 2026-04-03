import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @Roles('student', 'admin', 'faculty')
  list(@Req() req: any, @Query() query: any) {
    return this.achievementsService.listAchievements(req.user, query);
  }

  @Post()
  @Roles('student')
  create(@Req() req: any, @Body() body: any) {
    return this.achievementsService.createAchievement(req.user, body);
  }

  @Put(':id')
  @Roles('student')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.achievementsService.updateAchievement(req.user, id, body);
  }

  @Delete(':id')
  @Roles('student', 'admin')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.achievementsService.deleteAchievement(req.user, id);
  }

}
