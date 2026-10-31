import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceRole } from '../../common/constants/role.enum';
import { ERROR_MESSAGES } from '../../common/constants/error-codes.constant';
import { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(createDto: CreateProjectDto, userId: string): Promise<ProjectEntity> {
    await this.workspacesService.verifyWorkspaceRole(
      createDto.workspaceId,
      userId,
      [WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER],
    );

    const existingKey = await this.projectRepository.findOne({
      where: {
        workspaceId: createDto.workspaceId,
        key: createDto.key.toUpperCase(),
      },
    });

    if (existingKey) {
      throw new ConflictException(ERROR_MESSAGES.PROJECT_KEY_EXISTS);
    }

    const project = this.projectRepository.create({
      ...createDto,
      key: createDto.key.toUpperCase(),
    });

    return this.projectRepository.save(project);
  }

  async findAll(
    filterDto: ProjectFilterDto,
    userId: string,
  ): Promise<PaginatedResponse<ProjectEntity>> {
    const { page, limit, skip, search, workspaceId, status } = filterDto;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .innerJoin(
        'project.workspace',
        'workspace',
      )
      .innerJoin(
        'workspace.members',
        'member',
        'member.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('project.tasks', 'tasks');

    if (workspaceId) {
      queryBuilder.andWhere('project.workspaceId = :workspaceId', {
        workspaceId,
      });
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(project.name) LIKE LOWER(:search) OR LOWER(project.key) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('project.createdAt', 'DESC').skip(skip).take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();
    return new PaginatedResponse(items, totalItems, page, limit);
  }

  async findById(id: string, userId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['workspace', 'tasks'],
    });

    if (!project) {
      throw new NotFoundException(ERROR_MESSAGES.PROJECT_NOT_FOUND);
    }

    await this.workspacesService.verifyWorkspaceRole(
      project.workspaceId,
      userId,
      [
        WorkspaceRole.OWNER,
        WorkspaceRole.ADMIN,
        WorkspaceRole.MEMBER,
        WorkspaceRole.VIEWER,
      ],
    );

    return project;
  }

  async update(
    id: string,
    updateDto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectEntity> {
    const project = await this.findById(id, userId);

    await this.workspacesService.verifyWorkspaceRole(
      project.workspaceId,
      userId,
      [WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER],
    );

    Object.assign(project, updateDto);
    return this.projectRepository.save(project);
  }

  async delete(id: string, userId: string): Promise<void> {
    const project = await this.findById(id, userId);

    await this.workspacesService.verifyWorkspaceRole(
      project.workspaceId,
      userId,
      [WorkspaceRole.OWNER, WorkspaceRole.ADMIN],
    );

    await this.projectRepository.softRemove(project);
  }
}

