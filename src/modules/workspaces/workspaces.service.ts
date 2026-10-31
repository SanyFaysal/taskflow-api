import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { WorkspaceEntity } from './entities/workspace.entity';
import { WorkspaceMemberEntity } from './entities/workspace-member.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddWorkspaceMemberDto } from './dto/add-member.dto';
import { UsersService } from '../users/users.service';
import { WorkspaceRole } from '../../common/constants/role.enum';
import { ERROR_MESSAGES } from '../../common/constants/error-codes.constant';
import { PaginationDto, PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(WorkspaceMemberEntity)
    private readonly memberRepository: Repository<WorkspaceMemberEntity>,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, ownerId: string): Promise<WorkspaceEntity> {
    const existing = await this.workspaceRepository.findOne({
      where: { slug: createWorkspaceDto.slug },
    });
    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.WORKSPACE_SLUG_EXISTS);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const workspace = queryRunner.manager.create(WorkspaceEntity, {
        ...createWorkspaceDto,
        ownerId,
      });
      const savedWorkspace = await queryRunner.manager.save(workspace);

      const ownerMembership = queryRunner.manager.create(WorkspaceMemberEntity, {
        workspaceId: savedWorkspace.id,
        userId: ownerId,
        role: WorkspaceRole.OWNER,
      });
      await queryRunner.manager.save(ownerMembership);

      await queryRunner.commitTransaction();
      return this.findById(savedWorkspace.id, ownerId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAllForUser(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<WorkspaceEntity>> {
    const { limit, skip, page, search } = paginationDto;

    const queryBuilder = this.workspaceRepository
      .createQueryBuilder('workspace')
      .innerJoin(
        'workspace.members',
        'member',
        'member.userId = :userId',
        { userId },
      )
      .leftJoinAndSelect('workspace.members', 'allMembers')
      .leftJoinAndSelect('allMembers.user', 'memberUser');

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(workspace.name) LIKE LOWER(:search) OR LOWER(workspace.slug) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    queryBuilder.orderBy('workspace.createdAt', 'DESC').skip(skip).take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();
    return new PaginatedResponse(items, totalItems, page, limit);
  }

  async findById(id: string, userId?: string): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ['members', 'members.user', 'owner'],
    });

    if (!workspace) {
      throw new NotFoundException(ERROR_MESSAGES.WORKSPACE_NOT_FOUND);
    }

    if (userId) {
      const isMember = workspace.members.some((m) => m.userId === userId);
      if (!isMember) {
        throw new ForbiddenException(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
      }
    }

    return workspace;
  }

  async update(
    id: string,
    updateDto: UpdateWorkspaceDto,
    userId: string,
  ): Promise<WorkspaceEntity> {
    await this.verifyWorkspaceRole(id, userId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const workspace = await this.findById(id);
    Object.assign(workspace, updateDto);
    return this.workspaceRepository.save(workspace);
  }

  async addMember(
    workspaceId: string,
    addMemberDto: AddWorkspaceMemberDto,
    requesterId: string,
  ): Promise<WorkspaceMemberEntity> {
    await this.verifyWorkspaceRole(workspaceId, requesterId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const userToAdd = await this.usersService.findByEmailWithPassword(
      addMemberDto.email,
    );
    if (!userToAdd) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const existingMember = await this.memberRepository.findOne({
      where: { workspaceId, userId: userToAdd.id },
    });
    if (existingMember) {
      throw new ConflictException('User is already a member of this workspace');
    }

    const member = this.memberRepository.create({
      workspaceId,
      userId: userToAdd.id,
      role: addMemberDto.role,
    });

    return this.memberRepository.save(member);
  }

  async removeMember(
    workspaceId: string,
    memberUserId: string,
    requesterId: string,
  ): Promise<void> {
    await this.verifyWorkspaceRole(workspaceId, requesterId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const member = await this.memberRepository.findOne({
      where: { workspaceId, userId: memberUserId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in workspace');
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Cannot remove the workspace owner');
    }

    await this.memberRepository.remove(member);
  }

  async delete(id: string, userId: string): Promise<void> {
    await this.verifyWorkspaceRole(id, userId, [WorkspaceRole.OWNER]);
    const workspace = await this.findById(id);
    await this.workspaceRepository.softRemove(workspace);
  }

  async verifyWorkspaceRole(
    workspaceId: string,
    userId: string,
    allowedRoles: WorkspaceRole[],
  ): Promise<WorkspaceMemberEntity> {
    const member = await this.memberRepository.findOne({
      where: { workspaceId, userId },
    });

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenException(ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS);
    }

    return member;
  }
}

