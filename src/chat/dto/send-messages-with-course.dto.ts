import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';
import { SendMessagesDto } from './send-messages.dto';

export class SendMessagesWithCourseDto extends SendMessagesDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;
}
