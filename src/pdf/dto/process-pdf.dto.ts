import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProcessPdfDto {
  @ApiProperty({ example: '/uploads/file-123.pdf' })
  @IsNotEmpty()
  @IsString()
  filePath: string;
}
