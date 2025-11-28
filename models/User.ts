import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'courses' }] })
  courses: Types.ObjectId[];

  @Prop({ required: true })
  avatar: string;

  @Prop({ default: Date.now })
  date: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
