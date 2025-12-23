import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsMongoId, Min, Max } from 'class-validator';

export class GenerateQuizDto {
  @ApiProperty({ enum: ['quiz', 'exam'], default: 'quiz' })
  @IsIn(['quiz', 'exam'])
  quizType: 'quiz' | 'exam' = 'quiz';

  @ApiProperty({ required: false, description: 'Optional custom title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false, description: 'Number of questions (3-20)', default: 8 })
  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(20)
  numQuestions?: number = 8;

  @ApiProperty({ required: false, description: 'Group chat id to associate for leaderboard' })
  @IsOptional()
  @IsMongoId()
  groupId?: string;
}

