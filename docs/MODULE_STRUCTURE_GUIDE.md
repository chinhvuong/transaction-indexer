# Module Structure Guide

## 🎯 **Overview**

This guide explains the refactored module structure that follows a consistent pattern across all modules to improve maintainability, prevent circular dependencies, and provide clear separation of concerns.

## 🏗️ **Module Structure Pattern**

Each module follows this consistent structure:

```
src/modules/{module-name}/
├── {module-name}.module.ts
├── controllers/
│   └── {module-name}.controller.ts
├── services/
│   ├── {module-name}.service.ts
│   ├── {module-name}-validation.service.ts
│   └── {module-name}-creation.service.ts
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

## 📋 **Module Responsibilities**

### **1. Auth Module** (`src/modules/auth/`)
**Purpose**: Authentication and authorization
- **Controllers**: Login, register, logout, refresh token
- **Services**: Authentication business logic, IP tracking
- **Guards**: JWT auth, role-based access control
- **Strategies**: Passport JWT and local strategies
- **DTOs**: Login, register, token refresh DTOs
- **Errors**: Auth-specific error classes

### **2. Users Module** (`src/modules/users/`)
**Purpose**: User management and profile operations
- **Controllers**: CRUD operations, search, profile updates
- **Services**: User business logic, validation
- **Entities**: User entity definition (registered in repositories module)
- **DTOs**: User creation, update, search DTOs
- **Errors**: User-specific error classes

### **3. Queue Module** (`src/modules/queue/`)
**Purpose**: Background job processing
- **Controllers**: Queue management endpoints
- **Services**: Queue service and producers
- **Processors**: Job processors for each queue type
- **Constants**: Queue names, processors, configuration
- **Types**: Job data interfaces
- **DTOs**: Queue status and management DTOs
- **Errors**: Queue-specific error classes

### **4. Repositories Module** (`src/modules/repositories/`)
**Purpose**: Global entity and repository registration
- **Entities**: All entities registered here (User, Session, etc.)
- **Repositories**: All repositories registered here (UserRepository, SessionRepository, etc.)
- **Constants**: Entity and repository names
- **Types**: Repository-related types
- **Module**: Central registration point for all data access

## 🔄 **Circular Dependency Prevention**

### **Problem Solved**
Before refactoring, modules could create circular dependencies:
```
Module A → imports Repository B → imports Module B → imports Repository A
```

### **Solution Implemented**
The repositories module acts as a central hub:
```
Module A → imports RepositoriesModule → exports Repository A & B
Module B → imports RepositoriesModule → exports Repository A & B
```

### **Benefits**
- ✅ **No circular dependencies**
- ✅ **Centralized data access**
- ✅ **Clean architecture**
- ✅ **Type safety**

## 📋 **Standard Module Templates**

### **Standard Module Template**
```typescript
// src/modules/{module-name}/{module-name}.module.ts
import { Module } from '@nestjs/common';
import { {Entity}Controller } from './controllers/{module-name}.controller';
import { {Entity}Service } from './services/{module-name}.service';

@Module({
  controllers: [{Entity}Controller],
  providers: [{Entity}Service],
  exports: [{Entity}Service],
})
export class {Entity}Module {}
```

### **Module with Multiple Controllers**
```typescript
// src/modules/{module-name}/{module-name}.module.ts
import { Module } from '@nestjs/common';
import { {Entity}Controller } from './controllers/{module-name}.controller';
import { {Entity}ManagementController } from './controllers/{module-name}-management.controller';
import { {Entity}Service } from './services/{module-name}.service';

@Module({
  controllers: [
    {Entity}Controller,
    {Entity}ManagementController,
  ],
  providers: [{Entity}Service],
  exports: [{Entity}Service],
})
export class {Entity}Module {}
```

### **Module with Dependencies**
```typescript
// src/modules/{module-name}/{module-name}.module.ts
import { Module } from '@nestjs/common';
import { {Entity}Controller } from './controllers/{module-name}.controller';
import { {Entity}Service } from './services/{module-name}.service';

@Module({
  imports: [],
  controllers: [{Entity}Controller],
  providers: [{Entity}Service],
  exports: [{Entity}Service],
})
export class {Entity}Module {}
```

### **Global Module (Repositories)**
```typescript
// src/modules/repositories/repositories.module.ts
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '@/modules/users/entities/user.entity';
import { UserRepository } from '@/modules/repositories/repositories/user.repository';

const providers = [
  UserRepository,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],
  providers,
  exports: providers,
})
export class RepositoriesModule {}
```

### **App Module Structure**
```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';
import { QueueModule } from '@/modules/queue/queue.module';
import { ConfigModule } from '@nestjs/config';
import { configDatabase } from '@/shared/configs/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validate } from '@/shared/configs/env.config';

@Module({
  imports: [
    // system modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => configDatabase,
    }),

    // feature modules
    AuthModule, 
    UsersModule, 
    RepositoriesModule, 
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

## 🚀 **Usage Examples**

### **Using Repositories in Services**

```typescript
// In any service
import { UserRepository } from '@/modules/repositories/repositories/user.repository';
import { SessionRepository } from '@/modules/repositories/repositories/session.repository';

@Injectable()
export class YourService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async someMethod() {
    const user = await this.userRepository.findByEmail('user@example.com');
    const sessions = await this.sessionRepository.findActiveSessionsByUserId(user.id);
    // ... business logic
  }
}
```

### **Using Queue Service**

```typescript
// In any service
import { QueueService } from '../queue/services/queue.service';
import { EmailJobData } from '../queue/types/queue.types';

@Injectable()
export class EmailService {
  constructor(private readonly queueService: QueueService) {}

  async sendWelcomeEmail(userEmail: string, userName: string) {
    const emailJob: EmailJobData = {
      id: `email-${Date.now()}`,
      timestamp: new Date(),
      to: userEmail,
      subject: 'Welcome!',
      template: 'welcome',
      context: { name: userName }
    };

    await this.queueService.addEmailJob(emailJob);
  }
}
```

### **Using Auth Guards**

```typescript
// In any controller
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('protected')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProtectedController {
  
  @Get('user-data')
  @Roles('user', 'admin')
  getUserData() {
    return { message: 'User data' };
  }

  @Get('admin-data')
  @Roles('admin')
  getAdminData() {
    return { message: 'Admin data' };
  }
}
```

## 📝 **How to Add a New Module**

### **Step 1: Create Module Structure**

```bash
mkdir -p src/modules/new-module/{controllers,services,dto,errors,entities,types,utils}
```

### **Step 2: Create Module Files**

```typescript
// src/modules/new-module/new-module.module.ts
import { Module } from '@nestjs/common';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';
import { NewModuleController } from './controllers/new-module.controller';
import { NewModuleService } from './services/new-module.service';

@Module({
  imports: [RepositoriesModule],
  controllers: [NewModuleController],
  providers: [NewModuleService],
  exports: [NewModuleService],
})
export class NewModuleModule {}
```

### **Step 3: Add to App Module**

```typescript
// src/app.module.ts
import { NewModuleModule } from './modules/new-module/new-module.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    QueueModule,
    RepositoriesModule,
    NewModuleModule, // <- Add here
  ],
  // ...
})
export class AppModule {}
```

### **Step 4: Create README**

```markdown
# New Module

## Purpose
Brief description of what this module does.

## Architecture
Description of the module structure and key components.

## Usage Examples
Code examples showing how to use this module.

## How to Add New Features
Step-by-step guide for extending the module.
```

## 🔧 **How to Add New Entities and Repositories**

### **Step 1: Create Entity**

```typescript
// src/modules/your-module/entities/your-entity.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('your_entities')
export class YourEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### **Step 2: Create Repository**

```typescript
// src/modules/repositories/repositories/your-entity.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AbstractRepository } from '@/shared/base/abstract.repository';
import { YourEntity } from '@/modules/your-module/entities/your-entity.entity';

@Injectable()
export class YourEntityRepository extends AbstractRepository<YourEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(YourEntity, dataSource);
  }

  async findByName(name: string): Promise<YourEntity | null> {
    return this.findOne({ where: { name } });
  }
}
```

### **Step 3: Update Repositories Module**

```typescript
// src/modules/repositories/repositories.module.ts
import { YourEntity } from '@/modules/your-module/entities/your-entity.entity';
import { YourEntityRepository } from '@/modules/repositories/repositories/your-entity.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      SessionEntity,
      YourEntity, // <- Add here
    ]),
  ],
  providers: [
    UserRepository,
    SessionRepository,
    YourEntityRepository, // <- Add here
  ],
  exports: [
    UserRepository,
    SessionRepository,
    YourEntityRepository, // <- Add here
  ],
})
export class RepositoriesModule {}
```

## 📝 **Module Naming Convention**
- **Module Class**: `{Entity}Module` (PascalCase)
- **Module File**: `{module-name}.module.ts` (kebab-case)
- **Module Directory**: `src/modules/{module-name}/` (kebab-case)

## 🏗️ **Module Organization Principles**
1. **Single Responsibility**: Each module should have a single, well-defined responsibility
2. **Encapsulation**: Module internals should be hidden from other modules
3. **Dependency Injection**: Use constructor injection for dependencies
4. **Exports**: Only export what other modules need to use
5. **Imports**: Import only what the module needs

## 📋 **Examples**
- Module: `users` → `UsersModule`, `users.module.ts`
- Module: `products` → `ProductsModule`, `products.module.ts`

## 🔗 **Module Dependencies**
When a module needs services from another module:

```typescript
// Module A needs services from Module B
@Module({
  imports: [ModuleB], // Import the module
  controllers: [ModuleAController],
  providers: [ModuleAService],
  exports: [ModuleAService],
})
export class ModuleAModule {}

// Module B exports its services
@Module({
  controllers: [ModuleBController],
  providers: [ModuleBService],
  exports: [ModuleBService], // Export for other modules to use
})
export class ModuleBModule {}
```

## 🎯 **Best Practices**

### **1. Always Use the Repositories Module**
```typescript
// ✅ Good
import { UserRepository } from '@/modules/repositories/repositories/user.repository';

// ❌ Bad
import { UserRepository } from '@/modules/users/repositories/user.repository';
```

### **2. Use Constants for Queue Names**
```typescript
// ✅ Good
import { QUEUE_NAMES } from '@/modules/queue/constants/queue.constants';
await this.queueService.addEmailJob(job);

// ❌ Bad
await this.queueService.addJob('email', job);
```

### **3. Use Error Factory Pattern**
```typescript
// ✅ Good
import { UserErrors } from '@/modules/users/errors/user.errors';
throw UserErrors.notFoundById(id.toString());

// ❌ Bad
throw new Error('User not found');
```

### **4. Follow DTO Pattern**
```typescript
// ✅ Good - Separate request and response DTOs
export class CreateUserBodyDto { /* request fields */ }
export class CreateUserResponseDto { /* response fields */ }

// ❌ Bad - Single DTO for both
export class CreateUserDto { /* mixed fields */ }
```

### **5. Use TypeScript Strictly**
```typescript
// ✅ Good - Typed job data
const emailJob: EmailJobData = {
  id: `email-${Date.now()}`,
  timestamp: new Date(),
  to: userEmail,
  subject: 'Welcome!',
  template: 'welcome',
  context: { name: userName }
};

// ❌ Bad - Untyped data
const emailJob = {
  to: userEmail,
  subject: 'Welcome!',
  // Missing required fields
};
```

## 🔍 **Module Dependencies**

### **Dependency Graph**
```
AppModule
├── AuthModule
│   └── RepositoriesModule
├── UsersModule
│   └── RepositoriesModule
├── QueueModule
│   └── (self-contained)
└── RepositoriesModule
    └── (base module)
```

### **Import Rules**
1. **AuthModule** → imports RepositoriesModule
2. **UsersModule** → imports RepositoriesModule
3. **QueueModule** → no external module dependencies
4. **RepositoriesModule** → base module, no external dependencies

## 📊 **File Organization Checklist**

When creating a new module, ensure you have:

- [ ] **Module file** (`{module-name}.module.ts`)
- [ ] **Controllers** in `controllers/` folder
- [ ] **Services** in `services/` folder
- [ ] **DTOs** in `dto/` folder (separate request/response)
- [ ] **Types** in `types/` folder
- [ ] **Errors** in `errors/` folder
- [ ] **Utils** in `utils/` folder (if needed)
- [ ] **README.md** with documentation
- [ ] **Module imported** in `app.module.ts`

When adding entities/repositories:

- [ ] **Entity file** in `entities/` folder
- [ ] **Repository file** in `repositories/repositories/` folder
- [ ] **Entity registered** in repositories module
- [ ] **Repository registered** in repositories module
- [ ] **Repository exported** from repositories module
- [ ] **Constants updated** in entities constants

---

**This structure ensures consistency, maintainability, and prevents circular dependencies across all modules.** 