// src/course/course.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseDocument } from '../schemas/course.schema';

@Injectable()
export class CourseService {
  constructor(@InjectModel('courses') private courseModel: Model<CourseDocument>) {}

  async list(userId: string) {
    const courses = await this.courseModel
      .find({ creator: userId })
      .populate('chats')
      .sort({ createdAt: -1 });
    return { message: 'success', courses };
  }

  /**
   * CREATE COURSE – now 100% safe for PDF fields
   */
  async create(body: any, authenticatedUserId: string) {
    const newCourse = new this.courseModel({
      title: body.title,
      description: body.description || '',
      creator: authenticatedUserId,           // ← NEVER trust body.creator (security fix!)
      chats: [],
      files: body.files || [],
      date: Date.now(),

      // Explicitly initialize PDF-related fields so they exist from day one
      // This guarantees savePdfContent() will work even if schema is missing them
      pdfContent: null,
      pdfProcessed: false,
      pdfProcessedAt: null,
      pdfFileName: null,
    });

    try {
      const course = await newCourse.save();
      return { message: 'success', course };
    } catch (error: any) {
      if (error.code === 11000 && error.keyPattern?.title) {
        return { status: 400, error: 'Course title already exists' };
      }
      return { status: 500, error: error.message || 'Failed to create course' };
    }
  }

  async remove(id: string, userId: string) {
    const result = await this.courseModel.findOneAndDelete({
      _id: id,
      creator: userId,
    });

    return result
      ? { message: 'success', id }
      : { status: 404, error: 'Course not found' };
  }
}