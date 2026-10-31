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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project inside a workspace' })
  @ApiResponse({ status: 201, type: ProjectResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateProjectDto,
  ) {
    const project = await this.projectsService.create(createDto, userId);
    return new ProjectResponseDto(project);
  }

  @Get()
  @ApiOperation({ summary: 'List projects in accessible workspaces with filters and pagination' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() filterDto: ProjectFilterDto,
  ) {
    const paginated = await this.projectsService.findAll(filterDto, userId);
    return {
      ...paginated,
      data: paginated.data.map((p) => new ProjectResponseDto(p)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details by UUID' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const project = await this.projectsService.findById(id, userId);
    return new ProjectResponseDto(project);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project details' })
  @ApiResponse({ status: 200, type: ProjectResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateProjectDto,
  ) {
    const updated = await this.projectsService.update(id, updateDto, userId);
    return new ProjectResponseDto(updated);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project (Workspace Owner or Admin only)' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.projectsService.delete(id, userId);
    return { message: 'Project deleted successfully' };
  }
}

