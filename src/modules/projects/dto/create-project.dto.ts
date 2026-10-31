import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ProjectStatus } from '../../../common/constants/role.enum';

export class CreateProjectDto {
  @ApiProperty({ example: 'Mobile Application Redesign' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    example: 'MAR',
    description: 'Short uppercase project identifier key (2 to 10 alphanumeric characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Key must consist of uppercase alphanumeric characters only',
  })
  key: string;

  @ApiPropertyOptional({ example: 'Next-generation iOS and Android cross-platform app' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.PLANNING })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ example: 'b9472e39-51ea-4ea2-80ff-27cbb0299fd2' })
  @IsUUID('4')
  @IsNotEmpty()
  workspaceId: string;
}

