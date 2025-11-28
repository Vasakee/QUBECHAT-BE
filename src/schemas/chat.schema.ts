import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  creator: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'courses', required: true })
  course: Types.ObjectId;

  @Prop({ type: [{ role: String, content: String, date: Date }] })
  messages: any[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
