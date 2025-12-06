// src/course/course.controller.ts

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CourseService } from './course.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CreateCourseDto } from './dto/create-course.dto';

@ApiTags('Course')
@ApiBearerAuth('jwt')
@Controller('api/course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('test')
  @UseGuards(JwtAuthGuard)
  test() {
    return { msg: 'Course module works!' };
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all courses for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  async list(@Req() req: any) {
    return await this.courseService.list(req.user.id);
  }

  @Post('new')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new course' })
  @ApiCreatedResponse({ description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Title already exists' })
  async create(@Body() body: CreateCourseDto, @Req() req: any) {
    // We now pass the real user ID from JWT — never trust body.creator
    return await this.courseService.create(body, req.user.id);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a course (only owner)' })
  @ApiResponse({ status: 200, description: 'Course deleted' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.courseService.remove(id, req.user.id);
  }
}