import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizSchema } from '../schemas/quiz.schema';
import { CourseSchema } from '../schemas/course.schema';
import { GroqModule } from '../common/groq.module';
import { PdfModule } from '../pdf/pdf.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    GroqModule,
    PdfModule,
    ChatModule,
    MongooseModule.forFeature([
      { name: 'quizzes', schema: QuizSchema },
      { name: 'courses', schema: CourseSchema },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}

