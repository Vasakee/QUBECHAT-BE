import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

export interface IMessage {
  role: string;
  content: string;
  date?: Date;
}

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: String, required: true, unique: true })
  title: string;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  creator: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'courses', required: true })
  course: Types.ObjectId;

  @Prop({
    type: [
      {
        role: { type: String, required: true },
        content: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  messages: IMessage[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
