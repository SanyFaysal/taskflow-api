import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../../../common/constants/role.enum';
import { TaskEntity } from '../entities/task.entity';
import { CommentEntity } from '../entities/comment.entity';

export class CommentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  authorId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty()
  createdAt: Date;

  constructor(comment: CommentEntity) {
    this.id = comment.id;
    this.content = comment.content;
    this.authorId = comment.authorId;
    this.authorName = comment.author
      ? `${comment.author.firstName || ''} ${comment.author.lastName || ''}`.trim() || comment.author.email
      : '';
    this.createdAt = comment.createdAt;
  }
}

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty({ required: false })
  dueDate?: Date;

  @ApiProperty({ required: false })
  estimatedHours?: number;

  @ApiProperty()
  actualHours: number;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  creatorId: string;

  @ApiProperty({ required: false })
  assigneeId?: string;

  @ApiProperty({ required: false })
  assigneeName?: string;

  @ApiProperty({ required: false })
  parentTaskId?: string;

  @ApiProperty({ type: [CommentResponseDto], required: false })
  comments?: CommentResponseDto[];

  @ApiProperty({ required: false })
  subtaskCount?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(task: TaskEntity) {
    this.id = task.id;
    this.title = task.title;
    this.description = task.description;
    this.status = task.status;
    this.priority = task.priority;
    this.dueDate = task.dueDate;
    this.estimatedHours = task.estimatedHours;
    this.actualHours = task.actualHours;
    this.projectId = task.projectId;
    this.creatorId = task.creatorId;
    this.assigneeId = task.assigneeId;
    this.parentTaskId = task.parentTaskId;
    this.createdAt = task.createdAt;
    this.updatedAt = task.updatedAt;

    if (task.assignee) {
      this.assigneeName = `${task.assignee.firstName || ''} ${task.assignee.lastName || ''}`.trim() || task.assignee.email;
    }

    if (task.comments) {
      this.comments = task.comments.map((c) => new CommentResponseDto(c));
    }

    if (task.subtasks) {
      this.subtaskCount = task.subtasks.length;
    }
  }
}

