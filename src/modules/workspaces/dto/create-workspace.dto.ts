import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({
    example: 'acme-corp',
    description: 'Unique URL-friendly slug containing lowercase letters, numbers, and hyphens',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens without consecutive hyphens',
  })
  slug: string;

  @ApiPropertyOptional({ example: 'Primary workspace for engineering and product development' })
  @IsOptional()
  @IsString()
  description?: string;
}

