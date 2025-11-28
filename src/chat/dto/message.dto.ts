import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ example: 'Hello, how can I help?' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
