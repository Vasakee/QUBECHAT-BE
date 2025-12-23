import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

export type QuizType = 'quiz' | 'exam';

@Schema({ timestamps: true })
export class QuizQuestion {
  @Prop({ required: true })
  prompt: string;

  @Prop({ type: [String], default: [] })
  options: string[];

  @Prop({ required: true })
  answer: string;

  @Prop({ type: String })
  explanation?: string;

  @Prop({ type: String, enum: ['mcq', 'short'], default: 'mcq' })
  kind: 'mcq' | 'short';
}

@Schema({ timestamps: true })
export class QuizAttempt {
  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  user: Types.ObjectId;

  @Prop({ type: Number, required: true })
  score: number;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: Number, required: true })
  percent: number;

  @Prop({
    type: [
      {
        questionIndex: { type: Number, required: true },
        answer: { type: String, required: true },
        correct: { type: Boolean, required: true },
      },
    ],
    default: [],
  })
  answers: {
    questionIndex: number;
    answer: string;
    correct: boolean;
  }[];

  @Prop({ type: Date, default: Date.now })
  takenAt: Date;
}

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ type: Types.ObjectId, ref: 'courses', required: true })
  course: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: String, enum: ['quiz', 'exam'], default: 'quiz' })
  quizType: QuizType;

  @Prop({ type: String })
  title?: string;

  @Prop({ type: Types.ObjectId, ref: 'groupchats' })
  groupId?: Types.ObjectId;

  @Prop({ type: [QuizQuestion], default: [] })
  questions: QuizQuestion[];

  @Prop({ type: [QuizAttempt], default: [] })
  attempts: QuizAttempt[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

