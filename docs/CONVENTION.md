# Coding Conventions & Standards

Essential conventions for NestJS Backend Boilerplate development.

## File Structure

### Project Root
```
src/
├── modules/                  # Feature modules
│   ├── auth/                # Authentication module
│   ├── users/               # User management module
│   └── repositories/        # Global repositories module
├── shared/                  # Shared utilities
│   ├── base/               # Base classes
│   ├── configs/            # Configuration files
│   ├── constants/          # Application constants
│   ├── dto/                # Shared DTOs
│   ├── errors/             # Error handling
│   ├── filters/            # Exception filters
│   ├── middlewares/        # Middlewares
│   ├── types/              # Shared type definitions
│   └── utils/              # Shared utility functions
└── database/               # Database files
    ├── migrations/         # Database migrations
    └── seeds/              # Database seeds
```

### Module Structure
```
src/modules/{module-name}/
├── {module-name}.module.ts
├── controllers/
│   └── {module-name}.controller.ts
├── services/
│   ├── {module-name}.service.ts
│   ├── {module-name}-validation.service.ts
│   ├── {module-name}-creation.service.ts
│   └── {module-name}-notification.service.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   ├── get-{entity}s.dto.ts
│   ├── get-{entity}.dto.ts
│   └── delete-{entity}.dto.ts
├── entities/
│   └── {entity}.entity.ts
├── errors/
│   └── {module-name}.errors.ts
├── guards/
├── decorators/
├── strategies/
├── types/
│   └── index.ts
└── utils/
    ├── {module-name}-helpers.ts
    └── {module-name}-validators.ts
```

### Repository Organization
```
src/modules/repositories/
├── repositories.module.ts    # Global module
├── repositories/
│   ├── user.repository.ts
│   ├── session.repository.ts
│   └── {entity}.repository.ts
```

## Naming Conventions

### Files & Directories
- **kebab-case** for file and directory names
- **PascalCase** for class names
- **camelCase** for variables, functions, and methods

### Variables & Functions
```typescript
// Variables - camelCase
const userEmail = 'user@example.com';
const userList: UserEntity[] = [];

// Functions - camelCase
function getUserById(id: string): Promise<UserEntity | null> { }
const createUser = (data: CreateUserBodyDto): Promise<UserEntity> => { }

// Constants - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 10;

// Avoid any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legacyFunction = (data: any): any => { }
```

### Classes & Interfaces
```typescript
// Classes - PascalCase
export class UserService { }
export class CreateUserBodyDto { }

// Interfaces - PascalCase with 'I' prefix
export interface IUserRepository { }

// Types - PascalCase
export type UserRole = 'admin' | 'user' | 'moderator';
```

### Enum Naming Convention
```typescript
// Enums - UPPER_SNAKE_CASE
export enum USER_ROLE {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR'
}
```

## DTO Conventions

### Single DTO File Per Request
```typescript
// src/modules/users/dto/create-user.dto.ts
export class CreateUserBodyDto { }
export class CreateUserResponseDto { }

// src/modules/users/dto/get-users.dto.ts
export class GetUsersQueryDto extends PaginationDto { }
export class GetUsersResponseDto { }
```

### List Requests
```typescript
// src/modules/users/dto/get-users.dto.ts
import { PaginationDto } from '@/shared/dto/pagination.dto';

export class GetUsersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class GetUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];
  
  @ApiProperty()
  total: number;
}
```

## Controller Conventions

### Key Principles
- **One DTO file per request** - exports both request and response DTOs
- **Use DTO classes** instead of inline schema definitions
- **Only include happy case** in `@ApiResponse({})`
- **Keep controllers simple and short**
- **Extend PaginationDto** for list requests

### Controller Example
```typescript
@Controller('users')
@ApiTags('Users')
export class UsersController {
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserBodyDto })
  @ApiResponse({ status: 201, type: CreateUserResponseDto })
  async createUser(@Body() createUserBodyDto: CreateUserBodyDto): Promise<CreateUserResponseDto> {
    return this.userService.createUser(createUserBodyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: GetUsersResponseDto })
  async getUsers(@Query() getUsersQueryDto: GetUsersQueryDto): Promise<GetUsersResponseDto> {
    return this.userService.getUsers(getUsersQueryDto);
  }
}
```

## Error Handling

### Error Factory Pattern
```typescript
// src/modules/users/errors/user.errors.ts
import { createErrorFactory } from '@/shared/errors/app-errors';

export const UserErrors = createErrorFactory({
  notFoundById: {
    code: 'USER_NOT_FOUND_BY_ID',
    statusCode: 404,
    message: (id: string) => `User with ID ${id} not found`,
  },
  alreadyExists: {
    code: 'USER_ALREADY_EXISTS',
    statusCode: 409,
    message: (email: string) => `User with email ${email} already exists`,
  },
});
```

### Error Usage
```typescript
// In service files
import { UserErrors } from '../errors/user.errors';

export class UserService {
  async getUserById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw UserErrors.notFoundById(id);
    }
    return user;
  }
}
```

## Service Conventions

### Key Principles
- **Keep services short** for easy lookup and tracing
- **Follow SOLID principles**
- **Break down complex services** into smaller, focused services
- **Extract pure functions** to utils folders. If that function can be used in other modules, create it in `shared/utils`
- **Avoid `any` type** - use proper TypeScript types

### Service Structure
```typescript
@Injectable()
export class UserService extends AbstractService<UserEntity> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly userValidationService: UserValidationService,
  ) {
    super(userRepository);
  }

  async createUser(createUserBodyDto: CreateUserBodyDto): Promise<UserEntity> {
    await this.userValidationService.validateCreateUser(createUserBodyDto);
    await this.checkUserExists(createUserBodyDto.email);
    const user = await this.createUserEntity(createUserBodyDto);
    return user;
  }

  private async checkUserExists(email: string): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw UserErrors.alreadyExists(email);
    }
  }
}
```

## Repository Organization

### Repository Module Structure
```typescript
// src/modules/repositories/repositories.module.ts
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      SessionEntity,
      // All entities registered here
    ]),
  ],
  providers: [
    UserRepository,
    SessionRepository,
    // All repositories as providers
  ],
  exports: [
    UserRepository,
    SessionRepository,
    // Export all repositories
  ],
})
export class RepositoriesModule {}
```

### Repository Usage
```typescript
// In any service - no imports needed
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository, // Available globally
    private readonly sessionRepository: SessionRepository, // Available globally
  ) {}

  async createUser(createUserBodyDto: CreateUserBodyDto): Promise<UserEntity> {
    const user = this.userRepository.create(createUserBodyDto);
    return this.userRepository.save(user);
  }
}
```

### Repository Pattern
```typescript
// src/modules/repositories/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AbstractRepository } from '@/shared/base/abstract.repository';
import { UserEntity } from '@/modules/users/entities/user.entity';

@Injectable()
export class UserRepository extends AbstractRepository<UserEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(UserEntity, dataSource);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findOne({ where: { email } });
  }
}
```

## Queue Module Conventions

- **Centralize all queue logic in the `queue` module.**  
  Do not register or use Bull queues in other modules. All queue names, processors, and default options are defined in `queue/constants/queue.constants.ts`.

- **Typed Job Producers:**  
  Use `QueueProducersService` to add jobs. Each method enforces the correct job data type (see `queue/types/index.ts`).  
  Never use `any` for job payloads.

- **Adding a New Queue:**  
  1. Add queue name and processor to `queue/constants/queue.constants.ts`.
  2. Define the job data type in `queue/types/index.ts`.
  3. Add a producer method in `queue/services/queue-producers.service.ts`.
  4. Add a service method in `queue/services/queue.service.ts` if needed.
  5. Implement the processor in `queue/processors/`.
  6. Register the queue and processor in `queue.module.ts`.

- **Usage Example:**
  ```typescript
  await this.queueProducers.addEmailJob(emailJobData);
  ```

- **Do not register or use BullModule.registerQueue in other modules.**  
  All queue registration is centralized.

- **Benefits:**  
  - Prevents duplicate queue registration and circular dependencies.  
  - Ensures all job data is strongly typed and consistent.  
  - Makes it easy to discover, monitor, and manage all background jobs in one place. 

## Database & Migrations

### Entity Structure
```typescript
// src/modules/users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { USER_ROLE } from '@/shared/constants';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: USER_ROLE, default: USER_ROLE.USER })
  role: USER_ROLE;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Migration Commands
```bash
# Generate new migration
npm run db:generate --name=CreateUsersTable

# Run migrations
npm run db:run

# Revert last migration
npm run db:revert

# Show migration status
npm run db:show

# Reset database
npm run db:reset
```

## Utility Functions Organization

### Module-Specific Utils
```typescript
// src/modules/users/utils/user-helpers.ts
export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Shared Utils
```typescript
// src/shared/utils/string-helpers.ts
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
```

## Comments
- **Only comment when necessary** - explain why, not how
- **Use meaningful variable names** instead of comments
- **Comment complex business logic** that isn't self-explanatory
- **Avoid obvious comments** that just repeat the code

```typescript
// Good - explains why
// Skip validation for admin users to allow bulk operations
if (user.role === USER_ROLE.ADMIN) {
  return true;
}

// Bad - just repeats what the code does
// Check if user is admin
if (user.role === USER_ROLE.ADMIN) {
  return true;
}
```

## Development Workflow

### Adding New Feature
1. **Create feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Create module structure**
   ```bash
   nest generate module modules/new-feature
   nest generate controller modules/new-feature/controllers
   nest generate service modules/new-feature/services
   ```

3. **Create entities and DTOs**
   ```bash
   touch src/modules/new-feature/entities/new-feature.entity.ts
   touch src/modules/new-feature/dto/create-new-feature.dto.ts
   touch src/modules/new-feature/dto/update-new-feature.dto.ts
   touch src/modules/new-feature/dto/get-new-features.dto.ts
   touch src/modules/new-feature/dto/get-new-feature.dto.ts
   touch src/modules/new-feature/dto/delete-new-feature.dto.ts
   touch src/modules/new-feature/errors/new-feature.errors.ts
   touch src/modules/new-feature/utils/new-feature-helpers.ts
   ```

4. **Create repository**
   ```bash
   touch src/modules/repositories/repositories/new-feature.repository.ts
   # Update repositories module - add entity to TypeOrmModule.forFeature([])
   # Add repository to providers and exports
   ```

5. **Generate migration**
   ```bash
   npm run db:generate --name=CreateNewFeatureTable
   npm run db:run
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m "feat(new-feature): add new feature implementation"
   git push origin feature/new-feature
   ```

## Git Workflow

### Branch Naming
```bash
# Feature branches
feature/user-authentication
feature/add-payment-system

# Bug fixes
fix/login-validation-error

# Hotfixes
hotfix/security-vulnerability
```

### Commit Message Convention
```bash
# Format: type(scope): description
feat(auth): add JWT authentication
fix(users): resolve user creation validation
docs(api): update API documentation
refactor(auth): simplify authentication logic
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## Best Practices

### Code Quality
- Use TypeScript strict mode
- Prefer composition over inheritance
- Keep functions small and focused
- Use meaningful variable names
- Handle errors gracefully
- **Avoid `any` type** - use proper TypeScript types
- **Use `// eslint-disable-next-line`** comment when `any` is required
- **Extract pure functions** to utils folders
- **Follow SOLID principles** in service design

### Performance
- Use database indexes appropriately
- Implement caching where needed
- Use pagination for large datasets

### Security
- Validate all inputs
- Use environment variables for secrets
- Implement proper authentication
- Sanitize user inputs

### Maintainability
- Follow DRY principle
- Write self-documenting code
- Use consistent formatting
- Keep dependencies updated 