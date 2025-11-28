import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
//import { CourseController } from './course.controller';
//import { CourseService } from './course.service';
import { CourseSchema } from '../schemas/course.schema';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'courses', schema: CourseSchema }])],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
