import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../common/constants/role.enum';
import { UserEntity } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'b9472e39-51ea-4ea2-80ff-27cbb0299fd2' })
  id: string;

  @ApiProperty({ example: 'developer@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ enum: Role, example: Role.USER })
  role: Role;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-10-31T19:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-31T19:00:00.000Z' })
  updatedAt: Date;

  constructor(user: Partial<UserEntity>) {
    this.id = user.id!;
    this.email = user.email!;
    this.firstName = user.firstName!;
    this.lastName = user.lastName!;
    this.role = user.role!;
    this.isActive = user.isActive!;
    this.createdAt = user.createdAt!;
    this.updatedAt = user.updatedAt!;
  }
}

