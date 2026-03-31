import { Body, Controller, Get, Post, Put, Req, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me/settings")
  getMySettings(@Req() req: any) {
    return this.usersService.getMySettings(req.user);
  }

  @Put("me/settings")
  updateMySettings(@Req() req: any, @Body() body: any) {
    return this.usersService.updateMySettings(req.user, body);
  }

  @Post("me/change-password")
  changePassword(@Req() req: any, @Body() body: any) {
    return this.usersService.changeMyPassword(req.user, body);
  }
}
