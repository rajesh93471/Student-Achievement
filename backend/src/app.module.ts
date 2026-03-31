import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { StudentsModule } from "./modules/students/students.module";
import { AchievementsModule } from "./modules/achievements/achievements.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { AdminModule } from "./modules/admin/admin.module";
import { FacultyModule } from "./modules/faculty/faculty.module";
import { ParentsModule } from "./modules/parents/parents.module";
import { UsersModule } from "./modules/users/users.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { ChatbotModule } from "./modules/chatbot/chatbot.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    StudentsModule,
    AchievementsModule,
    DocumentsModule,
    AdminModule,
    FacultyModule,
    ParentsModule,
    UsersModule,
    NotificationsModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
