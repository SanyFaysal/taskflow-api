import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { TaskPriority, TaskStatus } from '../../../common/constants/role.enum';
import { ProjectEntity } from '../../projects/entities/project.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { CommentEntity } from './comment.entity';

@Entity('tasks')
export class TaskEntity extends BaseEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ type: 'float', nullable: true })
  estimatedHours: number;

  @Column({ type: 'float', default: 0 })
  actualHours: number;

  @ManyToOne(() => ProjectEntity, (project) => project.tasks, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  project: ProjectEntity;

  @Column()
  projectId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: false })
  creator: UserEntity;

  @Column()
  creatorId: string;

  @ManyToOne(() => UserEntity, (user) => user.assignedTasks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  assignee: UserEntity;

  @Column({ nullable: true })
  assigneeId: string;

  @ManyToOne(() => TaskEntity, (task) => task.subtasks, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  parentTask: TaskEntity;

  @Column({ nullable: true })
  parentTaskId: string;

  @OneToMany(() => TaskEntity, (task) => task.parentTask)
  subtasks: TaskEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.task, {
    cascade: true,
  })
  comments: CommentEntity[];
}

