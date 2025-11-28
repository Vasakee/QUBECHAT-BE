import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  creator: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'chats' }] })
  chats: Types.ObjectId[];

  @Prop({ type: [{ path: String, name: String }] })
  files: any[];

  @Prop({ default: Date.now })
  date: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // delete chats linked
  const mongoose = require('mongoose');
  await mongoose.model('chats').deleteMany({ _id: { $in: this.chats } });
  next();
});
