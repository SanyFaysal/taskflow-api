import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceRole } from '../../../common/constants/role.enum';
import { WorkspaceEntity } from '../entities/workspace.entity';

export class WorkspaceMemberResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: WorkspaceRole })
  role: WorkspaceRole;
}

export class WorkspaceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty({ type: [WorkspaceMemberResponseDto], required: false })
  members?: WorkspaceMemberResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(workspace: WorkspaceEntity) {
    this.id = workspace.id;
    this.name = workspace.name;
    this.slug = workspace.slug;
    this.description = workspace.description;
    this.ownerId = workspace.ownerId;
    this.createdAt = workspace.createdAt;
    this.updatedAt = workspace.updatedAt;

    if (workspace.members) {
      this.members = workspace.members.map((m) => ({
        id: m.id,
        userId: m.userId,
        email: m.user?.email,
        name: `${m.user?.firstName || ''} ${m.user?.lastName || ''}`.trim(),
        role: m.role,
      }));
    }
  }
}

