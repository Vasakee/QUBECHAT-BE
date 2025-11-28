import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiPropertyOptional({ example: 'Chat title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: '646b...userId' })
  @IsNotEmpty()
  @IsString()
  creator: string;

  @ApiProperty({ example: '646b...courseId' })
  @IsNotEmpty()
  @IsString()
  course: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  @IsArray()
  messages?: any[];
}
