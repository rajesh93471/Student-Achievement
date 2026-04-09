import {
  BadRequestException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMySettings(user: any) {
    const found = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { settings: true },
    });
    if (!found) throw new NotFoundException('User not found');
    return { settings: found.settings };
  }

  async updateMySettings(user: any, body: any) {
    const { email, ...settings } = body;
    const found = await this.prisma.user.findUnique({ 
      where: { id: user.id },
      include: { student: true }
    });
    if (!found) throw new NotFoundException('User not found');
    
    const updateData: any = {
      settings: { ...((found.settings as any) || {}), ...settings }
    };

    if (email && email !== found.email) {
      updateData.email = email;
      if (found.student) {
        await this.prisma.student.update({
          where: { id: found.student.id },
          data: { email: email }
        });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });
    return { settings: updated.settings, email: updated.email };
  }

  async changeMyPassword(user: any, body: any) {
    const { currentPassword, newPassword } = body;
    const found = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (!found) throw new NotFoundException('User not found');
    const isMatch = await bcrypt.compare(currentPassword, found.password);
    if (!isMatch)
      throw new BadRequestException('Current password is incorrect');
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: await bcrypt.hash(newPassword, 10) },
    });
    return { message: 'Password updated' };
  }
}
