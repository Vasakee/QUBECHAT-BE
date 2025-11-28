// src/pdf/pdf.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { CourseSchema } from '../schemas/course.schema';
//import { CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'courses', schema: CourseSchema },
    ]),
  ],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService], 
})
export class PdfModule {}