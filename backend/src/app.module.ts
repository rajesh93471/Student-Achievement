import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { StudentsModule } from './modules/students/students.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { FacultyModule } from './modules/faculty/faculty.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/achieve/uploads',
    }),
    PrismaModule,
    AuthModule,
    StudentsModule,
    AchievementsModule,
    DocumentsModule,
    AdminModule,
    UsersModule,
    NotificationsModule,
    ChatbotModule,
    FacultyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
