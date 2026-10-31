import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'I have started testing the OAuth authorization code exchange.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

