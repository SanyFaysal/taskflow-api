import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { CommentEntity } from './entities/comment.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ProjectsService } from '../projects/projects.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceRole } from '../../common/constants/role.enum';
import { ERROR_MESSAGES } from '../../common/constants/error-codes.constant';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    private readonly projectsService: ProjectsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(createDto: CreateTaskDto, creatorId: string): Promise<TaskEntity> {
    const project = await this.projectsService.findById(createDto.projectId, creatorId);

    if (createDto.parentTaskId) {
      const parentTask = await this.taskRepository.findOne({
        where: { id: createDto.parentTaskId, projectId: createDto.projectId },
      });
      if (!parentTask) {
        throw new BadRequestException('Parent task does not exist in this project');
      }
    }

    const task = this.taskRepository.create({
      ...createDto,
      creatorId,
      dueDate: createDto.dueDate ? new Date(createDto.dueDate) : undefined,
    });

    return this.taskRepository.save(task);
  }

  async findAll(
    filterDto: TaskFilterDto,
    userId: string,
  ): Promise<PaginatedResponse<TaskEntity>> {
    const { page, limit, skip, search, projectId, assigneeId, status, priority } = filterDto;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .innerJoin('task.project', 'project')
      .innerJoin('project.workspace', 'workspace')
      .innerJoin(
        'workspace.members',
        'member',
        'member.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.subtasks', 'subtasks');

    if (projectId) {
      queryBuilder.andWhere('task.projectId = :projectId', { projectId });
    }

    if (assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', { assigneeId });
    }

    if (status) {
      queryBuilder.andWhere('task.status = :status', { status });
    }

    if (priority) {
      queryBuilder.andWhere('task.priority = :priority', { priority });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('task.createdAt', 'DESC').skip(skip).take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();
    return new PaginatedResponse(items, totalItems, page, limit);
  }

  async findById(id: string, userId: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: [
        'project',
        'project.workspace',
        'assignee',
        'creator',
        'subtasks',
        'comments',
        'comments.author',
      ],
    });

    if (!task) {
      throw new NotFoundException(ERROR_MESSAGES.TASK_NOT_FOUND);
    }

    await this.workspacesService.verifyWorkspaceRole(
      task.project.workspaceId,
      userId,
      [
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.MEMBER,
        WorkspaceRole.VIEWER,
      ],
    );

    return task;
  }

  async update(
    id: string,
    updateDto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskEntity> {
    const task = await this.findById(id, userId);

    await this.workspacesService.verifyWorkspaceRole(
      task.project.workspaceId,
      userId,
      [WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER],
    );

    Object.assign(task, {
      ...updateDto,
      dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : task.dueDate,
    });

    return this.taskRepository.save(task);
  }

  async addComment(
    taskId: string,
    createCommentDto: CreateCommentDto,
    authorId: string,
  ): Promise<CommentEntity> {
    const task = await this.findById(taskId, authorId);

    const comment = this.commentRepository.create({
      taskId: task.id,
      authorId,
      content: createCommentDto.content,
    });

    const saved = await this.commentRepository.save(comment);
    return this.commentRepository.findOne({
      where: { id: saved.id },
      relations: ['author'],
    }) as Promise<CommentEntity>;
  }

  async delete(id: string, userId: string): Promise<void> {
    const task = await this.findById(id, userId);

    await this.workspacesService.verifyWorkspaceRole(
      task.project.workspaceId,
      userId,
      [WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER],
    );

    await this.taskRepository.softRemove(task);
  }
}

