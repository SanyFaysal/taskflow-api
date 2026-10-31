import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../../../common/constants/role.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement OAuth2 integration' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Implement Google and GitHub single sign-on flows' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-11-15T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedHours?: number;

  @ApiProperty({ example: 'b9472e39-51ea-4ea2-80ff-27cbb0299fd2' })
  @IsUUID('4')
  @IsNotEmpty()
  projectId: string;

  @ApiPropertyOptional({ example: 'b9472e39-51ea-4ea2-80ff-27cbb0299fd2' })
  @IsOptional()
  @IsUUID('4')
  assigneeId?: string;

  @ApiPropertyOptional({ example: 'b9472e39-51ea-4ea2-80ff-27cbb0299fd2' })
  @IsOptional()
  @IsUUID('4')
  parentTaskId?: string;
}

