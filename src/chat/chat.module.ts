import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatSchema } from '../schemas/chat.schema';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { GroqModule } from '../common/groq.module';
import { PdfModule } from '../pdf/pdf.module';
import { CourseSchema } from '../schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'chats', schema: ChatSchema },
      { name: 'courses', schema: CourseSchema } 
    ]),
    PdfModule,
    GroqModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
