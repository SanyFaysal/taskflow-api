import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../database/base.entity';
import { TaskEntity } from './task.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('task_comments')
export class CommentEntity extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => TaskEntity, (task) => task.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  task: TaskEntity;

  @Column()
  taskId: string;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  author: UserEntity;

  @Column()
  authorId: string;
}

