import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupChatController } from './groupchat.controller';
import { GroupChatService } from './groupchat.service';
import { GroupChatSchema } from '../schemas/groupchat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'groupchats', schema: GroupChatSchema },
    ]),
  ],
  providers: [GroupChatService],
  controllers: [GroupChatController],
  exports: [GroupChatService],
})
export class GroupChatModule {}
