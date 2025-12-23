import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FlashcardDocument = Flashcard & Document;

export interface IFlashcardField {
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewedAt?: Date;
  reviewCount?: number;
}

@Schema({ timestamps: true })
export class Flashcard {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  creator: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'courses', required: true })
  course: Types.ObjectId;

  @Prop({
    type: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
        lastReviewedAt: { type: Date },
        reviewCount: { type: Number, default: 0 },
      },
    ],
    default: [],
  })
  cards: IFlashcardField[];

  @Prop({ type: String, enum: ['public', 'private', 'shared'], default: 'private' })
  visibility: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'users' }], default: [] })
  sharedWith: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  totalCards: number;

  @Prop({ type: String, default: 'new' })
  status: string; // 'new', 'in-progress', 'completed'

  @Prop({ type: Number, default: 0 })
  masteredCount: number;
}

export const FlashcardSchema = SchemaFactory.createForClass(Flashcard);

// Index for efficient queries
FlashcardSchema.index({ creator: 1, course: 1 });
FlashcardSchema.index({ visibility: 1 });
