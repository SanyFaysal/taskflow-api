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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskFilterDto } from './dto/task-filter.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskResponseDto, CommentResponseDto } from './dto/task-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task or subtask' })
  @ApiResponse({ status: 201, type: TaskResponseDto })
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreateTaskDto,
  ) {
    const task = await this.tasksService.create(createDto, userId);
    return new TaskResponseDto(task);
  }

  @Get()
  @ApiOperation({ summary: 'List and filter tasks across accessible projects' })
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() filterDto: TaskFilterDto,
  ) {
    const paginated = await this.tasksService.findAll(filterDto, userId);
    return {
      ...paginated,
      data: paginated.data.map((t) => new TaskResponseDto(t)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complete task details including comments and subtasks' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    const task = await this.tasksService.findById(id, userId);
    return new TaskResponseDto(task);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task properties, status, or assignee' })
  @ApiResponse({ status: 200, type: TaskResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() updateDto: UpdateTaskDto,
  ) {
    const updated = await this.tasksService.update(id, updateDto, userId);
    return new TaskResponseDto(updated);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment or activity note to a task' })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  async addComment(
    @Param('id', ParseUUIDPipe) taskId: string,
    @CurrentUser('id') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.tasksService.addComment(
      taskId,
      createCommentDto,
      userId,
    );
    return new CommentResponseDto(comment);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.tasksService.delete(id, userId);
    return { message: 'Task deleted successfully' };
  }
}

