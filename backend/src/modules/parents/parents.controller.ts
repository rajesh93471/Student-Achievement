import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ParentsService } from "./parents.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("parents")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("parent")
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get("me")
  getParentDashboard(@Req() req: any) {
    return this.parentsService.getParentDashboard(req.user);
  }
}
