import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SavePdfContentDto {
  @ApiProperty({ example: '646b...courseId' })
  @IsNotEmpty()
  @IsString()
  courseId: string;

  @ApiProperty({ example: 'Extracted PDF text...' })
  @IsNotEmpty()
  @IsString()
  pdfText: string;
}
