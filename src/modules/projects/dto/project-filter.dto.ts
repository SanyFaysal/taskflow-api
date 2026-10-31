import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { ProjectStatus } from '../../../common/constants/role.enum';

export class ProjectFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by workspace ID' })
  @IsOptional()
  @IsUUID('4')
  workspaceId?: string;

  @ApiPropertyOptional({ enum: ProjectStatus, description: 'Filter by project lifecycle status' })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}

