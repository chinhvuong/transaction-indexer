# Repositories Module

## 🎯 **Purpose**

The Repositories Module is a **global module** responsible for registering all repositories as providers. It serves as a central hub to prevent circular dependencies and provides a clean way for other modules to access repositories. **Entities are defined in their respective modules**, and the repositories module imports them.

## 🏗️ **Architecture**

```
repositories/
├── constants/           # Entity and repository names
├── repositories/       # Global repositories (like SessionRepository)
├── types/              # TypeScript interfaces and types
└── README.md           # This file
```

## 🔧 **Key Components**

### **1. Repository Registration**
- Registers all repositories as providers
- Exports repositories for use by other modules
- Provides type-safe repository access

### **2. Circular Dependency Prevention**
- Acts as a central hub for data access
- Prevents modules from directly importing each other's repositories
- Enables clean architecture patterns

### **3. Entity Import**
- **Entities are NOT defined here** - they are defined in their respective modules
- Repositories module imports entities from other modules
- Centralizes repository registration and export

## 📋 **Current Entities & Repositories**

| Entity | Repository | Entity Location | Repository Location |
|--------|------------|-----------------|-------------------|
| `UserEntity` | `UserRepository` | `@/modules/users/entities/` | `@/modules/repositories/repositories/` |
| `SessionEntity` | `SessionRepository` | `@/modules/users/entities/` | `@/modules/repositories/repositories/` |

## 🚀 **Usage Examples**

### **Using Repositories in Other Modules**

```typescript
// In any service
import { UserRepository } from '@/modules/repositories/repositories/user.repository';
import { SessionRepository } from '@/modules/repositories/repositories/session.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
  ) {}

  async login(email: string, password: string) {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Create session
    const session = await this.sessionRepository.save({
      userId: user.id,
      refreshTokenHash: 'hashed-token',
      isActive: true,
    });

    return { user, session };
  }
}
```

### **Module Configuration**

```typescript
// In any module that needs repositories
import { Module } from '@nestjs/common';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule], // Import the global repositories module
  providers: [YourService],
  exports: [YourService],
})
export class YourModule {}
```

## 📝 **How to Add a New Entity and Repository**

### **Step-by-Step Guide**

#### **1. Create the Entity in Your Module**

```typescript
// modules/your-module/entities/your-entity.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@/shared/base/base.entity';

@Entity('your_entities')
export class YourEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
```

#### **2. Create the Repository in Repositories Module**

```typescript
// modules/repositories/repositories/your-entity.repository.ts
import { Injectable } from '@nestjs/common';
import { AbstractRepository } from '@/shared/base/abstract.repository';
import { YourEntity } from '@/modules/your-module/entities/your-entity.entity';

@Injectable()
export class YourEntityRepository extends AbstractRepository<YourEntity> {
  constructor() {
    super(YourEntity, null as any); // DataSource will be injected by AbstractRepository
  }

  async findByName(name: string): Promise<YourEntity | null> {
    return this.findOne({ where: { name } });
  }

  async findActive(): Promise<YourEntity[]> {
    return this.find({ where: { isActive: true } });
  }
}
```

#### **3. Update Repositories Module**

```typescript
// modules/repositories/repositories.module.ts
import { YourEntity } from '@/modules/your-module/entities/your-entity.entity';
import { YourEntityRepository } from './repositories/your-entity.repository';

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

#### **4. Update Constants**

```typescript
// modules/repositories/constants/entities.constants.ts
export const ENTITY_NAMES = {
  USER: 'User',
  SESSION: 'Session',
  YOUR_ENTITY: 'YourEntity', // <- Add here
} as const;

export const REPOSITORY_NAMES = {
  USER: 'UserRepository',
  SESSION: 'SessionRepository',
  YOUR_ENTITY: 'YourEntityRepository', // <- Add here
} as const;
```

#### **5. Use in Your Module**

```typescript
// modules/your-module/your-module.module.ts
import { Module } from '@nestjs/common';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';
import { YourService } from './services/your.service';

@Module({
  imports: [RepositoriesModule], // Import repositories
  providers: [YourService],
  exports: [YourService],
})
export class YourModule {}
```

```typescript
// modules/your-module/services/your.service.ts
import { Injectable } from '@nestjs/common';
import { YourEntityRepository } from '@/modules/repositories/repositories/your-entity.repository';

@Injectable()
export class YourService {
  constructor(
    private readonly yourEntityRepository: YourEntityRepository,
  ) {}

  async createYourEntity(data: any) {
    return this.yourEntityRepository.save(data);
  }
}
```

## 🔄 **Circular Dependency Prevention**

### **Problem**
Without the repositories module, you might have circular dependencies:

```
Module A → imports Repository B → imports Module B → imports Repository A
```

### **Solution**
The repositories module breaks this cycle:

```
Module A → imports RepositoriesModule → exports Repository A & B
Module B → imports RepositoriesModule → exports Repository A & B
```

### **Benefits**
- **No circular dependencies** - All modules import from repositories module
- **Centralized data access** - Single source of truth for repositories
- **Clean architecture** - Clear separation of concerns
- **Type safety** - Full TypeScript support

## 🛡️ **Best Practices**

### **1. Always Use the Repositories Module**
```typescript
// ✅ Good - Import from repositories module
import { UserRepository } from '@/modules/repositories/repositories/user.repository';

// ❌ Bad - Direct import from other module
import { UserRepository } from '@/modules/users/repositories/user.repository';
```

### **2. Define Entities in Their Respective Modules**
```typescript
// ✅ Good - Entity in its module
// modules/users/entities/user.entity.ts
@Entity('users')
export class UserEntity extends BaseEntity {
  // ...
}

// ❌ Bad - Entity in repositories module
// modules/repositories/entities/user.entity.ts
```

### **3. Keep Repository Logic in Repositories**
```typescript
// ✅ Good - Repository handles complex queries
async findActiveUsersWithSessions(): Promise<User[]> {
  return this.createQueryBuilder('user')
    .leftJoinAndSelect('user.sessions', 'session')
    .where('user.status = :status', { status: 'active' })
    .andWhere('session.isActive = :isActive', { isActive: true })
    .getMany();
}

// ❌ Bad - Service handles complex queries
// Complex query logic in service
```

### **4. Use Repository Methods for Business Logic**
```typescript
// ✅ Good - Repository method
async deactivateAllUserSessions(userId: string): Promise<void> {
  await this.update(
    { userId, isActive: true },
    { isActive: false }
  );
}

// ❌ Bad - Service method
// Update logic in service
```

### **5. Export All Repositories**
```typescript
// ✅ Good - Export all repositories
exports: [
  UserRepository,
  SessionRepository,
  YourRepository,
],

// ❌ Bad - Selective exports
exports: [UserRepository], // Missing others
```

## 📊 **Module Structure Checklist**

When adding a new entity, ensure you have:

- [ ] **Entity file** in `modules/your-module/entities/` (extends BaseEntity)
- [ ] **Repository file** in `modules/repositories/repositories/` (extends AbstractRepository)
- [ ] **Entity registered** in `repositories.module.ts`
- [ ] **Repository registered** in `repositories.module.ts`
- [ ] **Repository exported** in `repositories.module.ts`
- [ ] **Constants updated** in `constants/entities.constants.ts`
- [ ] **Module imports** `RepositoriesModule`

## 🔍 **Debugging**

### **Common Issues**

1. **Repository not found**
   ```typescript
   // Check if repository is exported in repositories.module.ts
   exports: [YourRepository]
   ```

2. **Entity not registered**
   ```typescript
   // Check if entity is in TypeOrmModule.forFeature
   TypeOrmModule.forFeature([YourEntity])
   ```

3. **Circular dependency**
   ```typescript
   // Ensure you're importing from repositories module, not other modules
   import { YourRepository } from '@/modules/repositories/repositories/your.repository';
   ```

### **Testing Repositories**

```typescript
// test/repositories/your.repository.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { YourRepository } from '@/modules/repositories/repositories/your.repository';

describe('YourRepository', () => {
  let repository: YourRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourRepository,
        {
          provide: getRepositoryToken(YourEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            // ... other methods
          },
        },
      ],
    }).compile();

    repository = module.get<YourRepository>(YourRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });
});
```

---

**For more information, see the individual component files and the main application documentation.** 