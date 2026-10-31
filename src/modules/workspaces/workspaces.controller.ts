import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { AddWorkspaceMemberDto } from './dto/add-member.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Workspaces')
@ApiBearerAuth('JWT-auth')
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({ status: 201, type: WorkspaceResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateWorkspaceDto,
  ) {
    const workspace = await this.workspacesService.create(createDto, userId);
    return new WorkspaceResponseDto(workspace);
  }

  @Get()
  @ApiOperation({ summary: 'List all workspaces the authenticated user belongs to' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const paginated = await this.workspacesService.findAllForUser(
      userId,
      paginationDto,
    );
    return {
      ...paginated,
      data: paginated.data.map((w) => new WorkspaceResponseDto(w)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace details by UUID' })
  @ApiResponse({ status: 200, type: WorkspaceResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const workspace = await this.workspacesService.findById(id, userId);
    return new WorkspaceResponseDto(workspace);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace details (Owner or Admin only)' })
  @ApiResponse({ status: 200, type: WorkspaceResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateWorkspaceDto,
  ) {
    const updated = await this.workspacesService.update(id, updateDto, userId);
    return new WorkspaceResponseDto(updated);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a new member to the workspace' })
  async addMember(
    @Param('id', ParseUUIDPipe) workspaceId: string,
    @CurrentUser('id') requesterId: string,
    @Body() addMemberDto: AddWorkspaceMemberDto,
  ) {
    return this.workspacesService.addMember(
      workspaceId,
      addMemberDto,
      requesterId,
    );
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove a member from the workspace' })
  async removeMember(
    @Param('id', ParseUUIDPipe) workspaceId: string,
    @Param('userId', ParseUUIDPipe) memberUserId: string,
    @CurrentUser('id') requesterId: string,
  ) {
    await this.workspacesService.removeMember(
      workspaceId,
      memberUserId,
      requesterId,
    );
    return { message: 'Member removed successfully' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace (Owner only)' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.workspacesService.delete(id, userId);
    return { message: 'Workspace deleted successfully' };
  }
}

