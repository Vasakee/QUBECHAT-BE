// src/pdf/pdf.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';
import { CourseSchema } from '../schemas/course.schema';
import { DoclingModule } from '../docling/docling.module';
//import { CourseSchema } from '../courses/schemas/course.schema';

@Module({
  imports: [
    DoclingModule,
    MongooseModule.forFeature([
      { name: 'courses', schema: CourseSchema },
    ]),
  ],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService], 
})
export class PdfModule {}