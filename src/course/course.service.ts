import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseDocument } from '../schemas/course.schema';

@Injectable()
export class CourseService {
  constructor(@InjectModel('courses') private courseModel: Model<CourseDocument>) {}

  async list(userId: string) {
    const courses = await this.courseModel.find({ creator: userId }).populate('chats').sort({ createdAt: -1 });
    return { message: 'success', courses };
  }

  async create(body: any) {
    const newCourse = new this.courseModel({
      title: body.title,
      description: body.description,
      creator: body.creator,
      files: body.files || [],
      date: Date.now(),
    });

    try {
      const course = await newCourse.save();
      return { message: 'success', course };
    } catch (error) {
      if (error.code === 11000) {
        if (error.keyPattern && error.keyPattern.title) {
          return { status: 400, errors: { title: 'Course Title already exists' } };
        }
      }
      return { status: 500, error: error.message };
    }
  }

  async remove(id: string, userId: string) {
    try {
      const result = await this.courseModel.findOneAndDelete({ _id: id, creator: userId });
      if (result) {
        return { message: 'success', id };
      } else {
        return { status: 404, error: 'Item not found' };
      }
    } catch (error) {
      return { status: 500, error: 'Error deleting item' };
    }
  }
}
