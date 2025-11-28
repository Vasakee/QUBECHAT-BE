// src/chat/dto/send-messages.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class SendMessagesDto {
  @ApiProperty({
    description: 'Array of chat messages',
    example: [
      { role: 'user', content: 'What is photosynthesis?' }
    ]
  })
  @IsArray()
  messages: any[];

  @ApiProperty({
    description: 'Course ID to get PDF context (optional)',
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  courseId?: string;
}