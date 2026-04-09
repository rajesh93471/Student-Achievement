import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RegisterStudentDto, LoginDto } from './dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/student')
  registerStudent(@Body() body: RegisterStudentDto) {
    return this.authService.registerStudent(body);
  }


  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('forgot-password/request-otp')
  requestPasswordResetOtp(@Body() body: { identifier: string }) {
    return this.authService.requestPasswordResetOtp(body);
  }

  @Post('forgot-password/verify-otp')
  verifyPasswordResetOtp(@Body() body: { identifier: string; otp: string }) {
    return this.authService.verifyPasswordResetOtp(body);
  }

  @Post('forgot-password/reset')
  resetPassword(
    @Body() body: { identifier: string; resetToken: string; password: string },
  ) {
    return this.authService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.authService.me(req.user);
  }
}
