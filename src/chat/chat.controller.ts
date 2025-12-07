// src/chat/chat.controller.ts
import { Controller, Get, Post, Delete, Body, Req, Param, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessagesDto } from './dto/send-messages.dto';
import { SendMessagesWithCourseDto } from './dto/send-messages-with-course.dto';

@ApiTags('Chat')
@ApiBearerAuth('jwt')
@Controller('api/v1/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('test')
  @UseGuards(JwtAuthGuard)
  test(@Req() req: any) {
    return { msg: 'Chat Works!' };
  }

  @Get('list/:courseID')
  @UseGuards(JwtAuthGuard)
  async list(@Param('courseID') courseID: string, @Req() req: any) {
    return await this.chatService.list(courseID, req.user?.id);
  }

  @Post('new')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new chat' })
  @ApiResponse({ status: 201, description: 'Chat created' })
  async create(@Body() body: CreateChatDto) {
    return await this.chatService.create(body);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a chat' })
  @ApiResponse({ status: 200, description: 'Chat deleted' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return await this.chatService.remove(id, req.user?.id);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send messages to Groq AI with optional PDF context' })
  @ApiResponse({ status: 200, description: 'AI response returned' })
  async send(@Body() body: SendMessagesWithCourseDto) {
    return await this.chatService.send(body.messages, body.courseId);
  }

  @Post('send-stream')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send messages with streaming response' })
  @ApiResponse({ status: 200, description: 'Streaming response started' })
  async sendStream(
    @Body() body: SendMessagesWithCourseDto,
    @Res() res: Response,
  ) {
    try {
      const stream = await this.chatService.sendStream(body.messages, body.courseId);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  @Get('with-course/:chatId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get chat with course info' })
  async getChatWithCourse(@Param('chatId') chatId: string, @Req() req: any) {
    return await this.chatService.getChatWithCourse(chatId, req.user?.id);
  }
}