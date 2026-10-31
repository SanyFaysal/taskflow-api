import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { ProjectStatus } from '../../../common/constants/role.enum';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';
import { TaskEntity } from '../../tasks/entities/task.entity';

@Entity('projects')
@Unique(['workspaceId', 'key'])
export class ProjectEntity extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ length: 10 })
  key: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  status: ProjectStatus;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.projects, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  workspace: WorkspaceEntity;

  @Column()
  workspaceId: string;

  @OneToMany(() => TaskEntity, (task) => task.project, {
    cascade: true,
  })
  tasks: TaskEntity[];
}

