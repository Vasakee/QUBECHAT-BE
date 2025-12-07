// src/upload/upload.controller.ts
import { 
  Controller, 
  Post, 
  UseGuards, 
  Get, 
  UseInterceptors, 
  UploadedFiles,
  Body,
  Req
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from './multer.options';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Upload')
@ApiBearerAuth('jwt')
@Controller('api/v1/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('doc')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10, multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        courseId: {
          type: 'string',
          example: '673c5e8f9a1b2c3d4e5f6789',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload document(s) and optionally process PDF' })
  @ApiResponse({ status: 201, description: 'Files uploaded' })
  async doc(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: any, // Changed to get full body
    @Req() req: any,
  ) {
    console.log('');
    console.log('UPLOAD CONTROLLER');
    console.log('Files received:', files?.length || 0);
    console.log('Full body:', JSON.stringify(body, null, 2));
    console.log('req.body:', JSON.stringify(req.body, null, 2));
    console.log('body.courseId:', body?.courseId);
    console.log('req.body.courseId:', req.body?.courseId);
    console.log('');

    // Try multiple ways to get courseId
    const courseId = body?.courseId || req.body?.courseId || body?.courseid || req.body?.courseid;
    
    console.log('Final courseId being passed:', courseId);
    
    return await this.uploadService.uploadDoc(files, courseId);
  }

  @Get('test')
  @UseGuards(JwtAuthGuard)
  test() {
    return { msg: 'Upload Works!' };
  }
}