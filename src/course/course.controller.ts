import { Controller, Get, Post, Delete, Body, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CourseService } from './course.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course.dto';

@ApiTags('Course')
@ApiBearerAuth('jwt')
@Controller('api/course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('test')
  @UseGuards(JwtAuthGuard)
  test(@Req() req: any) {
    return { msg: 'Course Works!' };
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: any) {
    return await this.courseService.list(req.user?.id);
  }

  @Post('new')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created' })
  async create(@Body() body: CreateCourseDto) {
    return await this.courseService.create(body);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.courseService.remove(id, req.user?.id);
  }
}
