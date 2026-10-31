import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../../../common/constants/role.enum';
import { ProjectEntity } from '../entities/project.entity';

export class ProjectResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  key: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: ProjectStatus })
  status: ProjectStatus;

  @ApiProperty()
  workspaceId: string;

  @ApiProperty({ required: false })
  taskCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(project: ProjectEntity) {
    this.id = project.id;
    this.name = project.name;
    this.key = project.key;
    this.description = project.description;
    this.status = project.status;
    this.workspaceId = project.workspaceId;
    this.createdAt = project.createdAt;
    this.updatedAt = project.updatedAt;

    if (project.tasks) {
      this.taskCount = project.tasks.length;
    }
  }
}

