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

  @Prop({ type: String, default: '' })
  pdfContent: string;

  @Prop({ type: Boolean, default: false })
  pdfProcessed: boolean;

  @Prop({ type: Date, default: null })
  pdfProcessedAt?: Date | null;

  @Prop({ type: String, default: null })
  pdfFileName?: string | null;

  // New: embedded flashcards array stored directly on the course document
  @Prop({
    type: [
      {
        front: { type: String, required: true }, // question / front side
        back: { type: String, required: true },  // answer / back side
        tags: { type: [String], default: [] },
        creator: { type: Types.ObjectId, ref: 'users', required: true },
        // Spaced-repetition fields (per-card defaults)
        easeFactor: { type: Number, default: 2.5 }, // Anki default
        interval: { type: Number, default: 0 }, // in days
        dueDate: { type: Date, default: null },
        // global review counters for the card
        reviewCount: { type: Number, default: 0 },
        lastReviewedAt: { type: Date },
        // per-user stats map: { userId: { reviewCount, lastReviewedAt, interval, easeFactor, dueDate } }
        stats: { type: Map, of: Object, default: {} },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  flashcards: any[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// pre-delete cleanup as before
CourseSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const mongoose = require('mongoose');
  await mongoose.model('chats').deleteMany({ _id: { $in: this.chats } });
  next();
});
