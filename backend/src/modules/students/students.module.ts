import { Module, forwardRef } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [forwardRef(() => AdminModule)],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
