import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @Roles('student')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body('key') key: string) {
    return this.documentsService.handleLocalUpload(req.user, file, key);
  }

  @Post('upload-url')
  @Roles('student')
  createUpload(@Req() req: any, @Body() body: any) {
    return this.documentsService.createDocumentUpload(req.user, body);
  }

  @Get()
  @Roles('student')
  listDocuments(@Req() req: any) {
    return this.documentsService.listDocuments(req.user);
  }

  @Post()
  @Roles('student')
  saveDocument(@Req() req: any, @Body() body: any) {
    return this.documentsService.saveDocument(req.user, body);
  }

  @Get(':id/download-url')
  @Roles('student', 'admin')
  download(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.getDocumentDownloadUrl(req.user, id);
  }

  @Delete(':id')
  @Roles('student', 'admin')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.documentsService.deleteDocument(req.user, id);
  }
}
