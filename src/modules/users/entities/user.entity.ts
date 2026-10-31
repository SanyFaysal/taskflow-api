import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { Role } from '../../../common/constants/role.enum';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';
import { WorkspaceMemberEntity } from '../../workspaces/entities/workspace-member.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';
import { CommentEntity } from '../../tasks/entities/comment.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ length: 100, nullable: true })
  firstName: string;

  @Column({ length: 100, nullable: true })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => WorkspaceEntity, (workspace) => workspace.owner)
  ownedWorkspaces: WorkspaceEntity[];

  @OneToMany(() => WorkspaceMemberEntity, (member) => member.user)
  workspaceMemberships: WorkspaceMemberEntity[];

  @OneToMany(() => TaskEntity, (task) => task.assignee)
  assignedTasks: TaskEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];
}

