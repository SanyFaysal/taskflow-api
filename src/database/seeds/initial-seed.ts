import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import dataSource from '../../config/typeorm.config';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { WorkspaceEntity } from '../../modules/workspaces/entities/workspace.entity';
import { WorkspaceMemberEntity } from '../../modules/workspaces/entities/workspace-member.entity';
import { ProjectEntity } from '../../modules/projects/entities/project.entity';
import { TaskEntity } from '../../modules/tasks/entities/task.entity';
import { CommentEntity } from '../../modules/tasks/entities/comment.entity';
import {
  ProjectStatus,
  Role,
  TaskPriority,
  TaskStatus,
  WorkspaceRole,
} from '../../common/constants/role.enum';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Automatically creates the target database if it doesn't exist yet
 * by connecting to PostgreSQL's default 'postgres' maintenance database.
 */
async function ensureDatabaseExists() {
  const targetDb = process.env.DB_DATABASE || 'taskflow_db';
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // default root database
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb],
    );

    if (res.rowCount === 0) {
      console.log(`📦 Database "${targetDb}" not found. Creating it automatically...`);
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`✅ Database "${targetDb}" created successfully!`);
    }
  } catch (error: any) {
    console.warn(`⚠️ Database check/creation notice: ${error.message}`);
  } finally {
    try {
      await client.end();
    } catch (_) {}
  }
}

async function seed() {
  // Step 1: Ensure database exists
  await ensureDatabaseExists();

  // Step 2: Connect TypeORM to target database
  console.log('🚀 Initializing database connection for seeding...');
  await dataSource.initialize();
  console.log('✅ Database connected.');

  const userRepo = dataSource.getRepository(UserEntity);
  const workspaceRepo = dataSource.getRepository(WorkspaceEntity);
  const memberRepo = dataSource.getRepository(WorkspaceMemberEntity);
  const projectRepo = dataSource.getRepository(ProjectEntity);
  const taskRepo = dataSource.getRepository(TaskEntity);
  const commentRepo = dataSource.getRepository(CommentEntity);

  // Check if already seeded
  const existingAdmin = await userRepo.findOne({
    where: { email: 'admin@taskflow.dev' },
  });

  if (existingAdmin) {
    console.log('ℹ️ Seed data already exists. Skipping seed operation.');
    await dataSource.destroy();
    return;
  }

  console.log('🌱 Seeding initial users...');
  const salt = 10;
  const adminPassword = await bcrypt.hash('Admin@123456', salt);
  const userPassword = await bcrypt.hash('User@123456', salt);

  const admin = userRepo.create({
    email: 'admin@taskflow.dev',
    password: adminPassword,
    firstName: 'System',
    lastName: 'Admin',
    role: Role.SYSTEM_ADMIN,
    isActive: true,
  });
  await userRepo.save(admin);

  const developer = userRepo.create({
    email: 'alex@taskflow.dev',
    password: userPassword,
    firstName: 'Alex',
    lastName: 'Rivera',
    role: Role.USER,
    isActive: true,
  });
  await userRepo.save(developer);

  console.log('🌱 Seeding workspace...');
  const workspace = workspaceRepo.create({
    name: 'Acme Cloud Platform',
    slug: 'acme-cloud',
    description: 'Central engineering workspace for cloud microservices & APIs',
    ownerId: admin.id,
  });
  await workspaceRepo.save(workspace);

  await memberRepo.save([
    memberRepo.create({
      workspaceId: workspace.id,
      userId: admin.id,
      role: WorkspaceRole.OWNER,
    }),
    memberRepo.create({
      workspaceId: workspace.id,
      userId: developer.id,
      role: WorkspaceRole.ADMIN,
    }),
  ]);

  console.log('🌱 Seeding project...');
  const project = projectRepo.create({
    name: 'Core API Microservices',
    key: 'CORE',
    description: 'High-performance NestJS RESTful API architecture with PostgreSQL',
    status: ProjectStatus.ACTIVE,
    workspaceId: workspace.id,
  });
  await projectRepo.save(project);

  console.log('🌱 Seeding tasks...');
  const task1 = taskRepo.create({
    title: 'Configure PostgreSQL Connection & TypeORM Migrations',
    description: 'Establish resilient database connection pool and run migration scripts.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    projectId: project.id,
    creatorId: admin.id,
    assigneeId: developer.id,
    estimatedHours: 6,
    actualHours: 4,
  });
  await taskRepo.save(task1);

  const task2 = taskRepo.create({
    title: 'Implement JWT Authentication & RBAC Guard',
    description: 'Set up Passport JWT strategy, refresh token rotation, and role guards.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.URGENT,
    projectId: project.id,
    creatorId: admin.id,
    assigneeId: developer.id,
    estimatedHours: 12,
    actualHours: 6,
  });
  await taskRepo.save(task2);

  const subtask1 = taskRepo.create({
    title: 'Write unit tests for JwtAuthGuard and RolesGuard',
    description: 'Ensure 100% test coverage on authentication and authorization paths.',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    projectId: project.id,
    creatorId: developer.id,
    assigneeId: developer.id,
    parentTaskId: task2.id,
    estimatedHours: 4,
  });
  await taskRepo.save(subtask1);

  console.log('🌱 Seeding comments...');
  await commentRepo.save([
    commentRepo.create({
      taskId: task2.id,
      authorId: admin.id,
      content: 'Make sure refresh tokens have distinct secret keys and expiration periods.',
    }),
    commentRepo.create({
      taskId: task2.id,
      authorId: developer.id,
      content: 'Configured. Refresh tokens expire in 7 days, access tokens in 1 day.',
    }),
  ]);

  console.log('🎉 Seeding successfully completed!');
  console.log('----------------------------------------------------');
  console.log('Default Credentials:');
  console.log('Admin:     admin@taskflow.dev / Admin@123456');
  console.log('Developer: alex@taskflow.dev  / User@123456');
  console.log('----------------------------------------------------');

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Error during seeding:', error);
  process.exit(1);
});
