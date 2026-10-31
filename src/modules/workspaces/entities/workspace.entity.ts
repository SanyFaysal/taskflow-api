import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { WorkspaceMemberEntity } from './workspace-member.entity';
import { ProjectEntity } from '../../projects/entities/project.entity';

@Entity('workspaces')
export class WorkspaceEntity extends BaseEntity {
  @Column({ length: 120 })
  name: string;

  @Column({ unique: true, length: 120 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.ownedWorkspaces, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  owner: UserEntity;

  @Column()
  ownerId: string;

  @OneToMany(() => WorkspaceMemberEntity, (member) => member.workspace, {
    cascade: true,
  })
  members: WorkspaceMemberEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.workspace, {
    cascade: true,
  })
  projects: ProjectEntity[];
}

