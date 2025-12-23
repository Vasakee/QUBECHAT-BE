import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNotEmpty, IsString, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class QuizAnswerDto {
  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  questionIndex: number;

  @ApiProperty({ example: 'B' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class SubmitQuizDto {
  @ApiProperty({ type: [QuizAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}

