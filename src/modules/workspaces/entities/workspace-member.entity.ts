import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { WorkspaceRole } from '../../../common/constants/role.enum';
import { WorkspaceEntity } from './workspace.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('workspace_members')
@Unique(['workspaceId', 'userId'])
export class WorkspaceMemberEntity extends BaseEntity {
  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.members, {
    onDelete: 'CASCADE',
  })
  workspace: WorkspaceEntity;

  @Column()
  workspaceId: string;

  @ManyToOne(() => UserEntity, (user) => user.workspaceMemberships, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: WorkspaceRole,
    default: WorkspaceRole.MEMBER,
  })
  role: WorkspaceRole;
}

