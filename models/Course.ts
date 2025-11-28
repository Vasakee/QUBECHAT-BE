// src/schemas/course.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ type: String, required: true, unique: true })
  title: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  creator: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'chats' }] })
  chats: Types.ObjectId[];

  @Prop({ type: [{ path: String, name: String }] })
  files: { path?: string; name?: string }[];

  @Prop({ default: Date.now })
  date: Date;

  // PDF fields
  @Prop({ type: String })
  pdfContent?: string;

  @Prop({ type: Boolean, default: false })
  pdfProcessed?: boolean;

  @Prop({ type: Date })
  pdfProcessedAt?: Date;

  @Prop({ type: String })
  pdfFileName?: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);