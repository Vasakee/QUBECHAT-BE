import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to NestJS' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'A short description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '646b...userId' })
  @IsNotEmpty()
  @IsString()
  creator: string;

  @ApiPropertyOptional({ type: [Object] })
  @IsOptional()
  files?: any[];
}
