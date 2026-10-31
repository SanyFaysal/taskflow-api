import {
  Controller,
  Get,
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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/constants/role.enum';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async getProfile(@CurrentUser() currentUser: AuthenticatedUser) {
    const user = await this.usersService.findById(currentUser.id);
    return new UserResponseDto(user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile of current authenticated user' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.usersService.update(userId, updateUserDto);
    return new UserResponseDto(updated);
  }

  @Get()
  @Roles(Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'List all users (Admin only, paginated)' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const paginated = await this.usersService.findAll(paginationDto);
    return {
      ...paginated,
      data: paginated.data.map((u) => new UserResponseDto(u)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details by UUID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findById(id);
    return new UserResponseDto(user);
  }

  @Delete(':id')
  @Roles(Role.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Soft-delete a user (Admin only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.softDelete(id);
    return { message: 'User deleted successfully' };
  }
}

