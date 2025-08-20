# Development Guide

Complete guide for developing with the NestJS Backend Boilerplate.

## 📋 Table of Contents

1. [Development Setup](#development-setup)
2. [Daily Workflow](#daily-workflow)
3. [Adding New Features](#adding-new-features)
4. [Database Operations](#database-operations)
5. [Testing](#testing)
6. [Code Quality](#code-quality)
7. [Troubleshooting](#troubleshooting)

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### First Time Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd nestjs-backend-boilerplate
   npm install
   ```

2. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env if needed (defaults work for development)
   ```

3. **Start development environment**
   ```bash
   npm run docker:start:dev
   ```

4. **Verify setup**
   ```bash
   # Test API health
   curl http://localhost:3000/health
   
   # Check API documentation
   open http://localhost:3000/docs
   ```

### Development Environment Features

- ✅ **Hot Reloading** - Changes reflect immediately
- ✅ **All Services** - PostgreSQL, Redis, Redis Commander
- ✅ **Volume Mounting** - Live code changes
- ✅ **Health Checks** - Automatic service orchestration
- ✅ **Cross-Platform** - Works on macOS, Linux, Windows

## 🔄 Daily Workflow

### Start Development
```bash
# Start all services
npm run docker:start:dev

# View logs
npm run docker:logs:dev
```

### Stop Development
```bash
# Stop all services
npm run docker:stop:dev

# Clean up everything
npm run docker:clean:dev
```

### Common Commands
```bash
# Restart API service only
npm run docker:restart:dev

# Rebuild API container
npm run docker:build:dev

# Clean start (clean + start)
npm run docker:start:dev:clean
```

## 🆕 Adding New Features

### 1. Create New Module

```bash
# Generate module structure
nest generate module modules/feature-name

# Generate controller
nest generate controller modules/feature-name/controllers

# Generate service
nest generate service modules/feature-name/services
```

### 2. Create Entity and Repository

#### Entity Template
```typescript
// src/modules/feature-name/entities/feature-name.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('feature_names')
export class FeatureNameEntity {
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

#### Repository Template
```typescript
// src/modules/repositories/repositories/feature-name.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AbstractRepository } from '@/shared/base/abstract.repository';
import { FeatureNameEntity } from '@/modules/feature-name/entities/feature-name.entity';

@Injectable()
export class FeatureNameRepository extends AbstractRepository<FeatureNameEntity> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(FeatureNameEntity, dataSource);
  }
}
```

#### Update Repositories Module
```typescript
// src/modules/repositories/repositories.module.ts
// Add to imports
FeatureNameEntity,

// Add to providers
FeatureNameRepository,

// Add to exports
FeatureNameRepository,
```

### 3. Create DTOs

#### Request DTO
```typescript
// src/modules/feature-name/dto/create-feature-name.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateFeatureNameBodyDto {
  @ApiProperty({ example: 'Feature Name' })
  @IsString()
  @MinLength(2)
  name: string;
}
```

#### Response DTO
```typescript
// src/modules/feature-name/dto/feature-name-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class FeatureNameResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Feature Name' })
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

### 4. Create Service

```typescript
// src/modules/feature-name/services/feature-name.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { FeatureNameRepository } from '@/modules/repositories/repositories/feature-name.repository';
import { CreateFeatureNameBodyDto } from '../dto/create-feature-name.dto';
import { FeatureNameEntity } from '../entities/feature-name.entity';

@Injectable()
export class FeatureNameService {
  private readonly logger = new Logger(FeatureNameService.name);

  constructor(
    private readonly featureNameRepository: FeatureNameRepository,
  ) {}

  async create(createDto: CreateFeatureNameBodyDto): Promise<FeatureNameEntity> {
    this.logger.log(`Creating feature with name: ${createDto.name}`);
    
    const entity = this.featureNameRepository.create(createDto);
    return this.featureNameRepository.save(entity);
  }

  async findAll(): Promise<FeatureNameEntity[]> {
    return this.featureNameRepository.find();
  }

  async findById(id: number): Promise<FeatureNameEntity | null> {
    return this.featureNameRepository.findOne({ where: { id } });
  }
}
```

### 5. Create Controller

```typescript
// src/modules/feature-name/controllers/feature-name.controller.ts
import { Controller, Get, Post, Body, Param, ParseIntPipe, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeatureNameService } from '../services/feature-name.service';
import { CreateFeatureNameBodyDto } from '../dto/create-feature-name.dto';
import { FeatureNameResponseDto } from '../dto/feature-name-response.dto';

@Controller('feature-names')
@ApiTags('Feature Names')
export class FeatureNameController {
  private readonly logger = new Logger(FeatureNameController.name);

  constructor(private readonly featureNameService: FeatureNameService) {}

  @Post()
  @ApiOperation({ summary: 'Create feature name' })
  @ApiResponse({ status: 201, type: FeatureNameResponseDto })
  async create(@Body() createDto: CreateFeatureNameBodyDto): Promise<FeatureNameResponseDto> {
    this.logger.log('Creating new feature name');
    const entity = await this.featureNameService.create(createDto);
    return this.mapToResponseDto(entity);
  }

  @Get()
  @ApiOperation({ summary: 'Get all feature names' })
  @ApiResponse({ status: 200, type: [FeatureNameResponseDto] })
  async findAll(): Promise<FeatureNameResponseDto[]> {
    const entities = await this.featureNameService.findAll();
    return entities.map(entity => this.mapToResponseDto(entity));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get feature name by ID' })
  @ApiResponse({ status: 200, type: FeatureNameResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<FeatureNameResponseDto> {
    const entity = await this.featureNameService.findById(id);
    if (!entity) {
      throw new Error('Feature name not found');
    }
    return this.mapToResponseDto(entity);
  }

  private mapToResponseDto(entity: any): FeatureNameResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
```

### 6. Update Module

```typescript
// src/modules/feature-name/feature-name.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureNameController } from './controllers/feature-name.controller';
import { FeatureNameService } from './services/feature-name.service';
import { FeatureNameEntity } from './entities/feature-name.entity';
import { RepositoriesModule } from '@/modules/repositories/repositories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureNameEntity]),
    RepositoriesModule,
  ],
  controllers: [FeatureNameController],
  providers: [FeatureNameService],
  exports: [FeatureNameService],
})
export class FeatureNameModule {}
```

### 7. Add to App Module

```typescript
// src/app.module.ts
// Add to imports
FeatureNameModule,
```

## 🗄️ Database Operations

### Migration Workflow

#### 1. Build Application (REQUIRED)
```bash
npm run build
```

#### 2. Generate Migration
```bash
npm run db:generate --name=CreateFeatureNamesTable
```

#### 3. Run Migration
```bash
npm run db:run
```

### Available Commands
```bash
# Build application (REQUIRED before migration generation)
npm run build

# Generate new migration
npm run db:generate --name=MigrationName

# Run migrations
npm run db:run

# Revert last migration
npm run db:revert

# Show migration status
npm run db:show

# Reset database (revert + run)
npm run db:reset
```

### Migration Naming Convention
- **Create Table**: `Create{EntityName}Table`
- **Add Column**: `Add{ColumnName}To{EntityName}Table`
- **Modify Column**: `Modify{ColumnName}In{EntityName}Table`
- **Add Index**: `AddIndexTo{EntityName}Table`

### Examples
```bash
# Create new table
npm run db:generate --name=CreateProductsTable

# Add column to existing table
npm run db:generate --name=AddDescriptionToProductsTable

# Add foreign key
npm run db:generate --name=AddCategoryIdToProductsTable
```

### Critical Rules

1. **Always build before generating migrations**
   ```bash
   npm run build
   npm run db:generate --name=MigrationName
   ```

2. **Register entities in repositories module**
   - Add to `TypeOrmModule.forFeature([])`
   - Add repository to providers and exports

3. **Use descriptive migration names**
   - Follow PascalCase convention
   - Be specific about what the migration does

### Troubleshooting

#### "No changes in database schema"
**Solution**: Build the application first
```bash
npm run build
npm run db:generate --name=MigrationName
```

#### "Entity not found"
**Solution**: Check entity registration in repositories module

#### "Migration already exists"
**Solution**: Use a different migration name
```bash
npm run db:generate --name=CreateProductsTableV2
```

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### E2E Tests
```bash
# Run E2E tests
npm run test:e2e
```

### Test Structure
```
src/
├── modules/
│   └── feature-name/
│       ├── __tests__/
│       │   ├── feature-name.service.spec.ts
│       │   └── feature-name.controller.spec.ts
│       └── ...
└── test/
    └── app.e2e-spec.ts
```

### Example Unit Test
```typescript
// src/modules/feature-name/__tests__/feature-name.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureNameService } from '../services/feature-name.service';
import { FeatureNameRepository } from '@/modules/repositories/repositories/feature-name.repository';

describe('FeatureNameService', () => {
  let service: FeatureNameService;
  let repository: FeatureNameRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureNameService,
        {
          provide: FeatureNameRepository,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeatureNameService>(FeatureNameService);
    repository = module.get<FeatureNameRepository>(FeatureNameRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a feature name', async () => {
    const createDto = { name: 'Test Feature' };
    const expectedEntity = { id: 1, ...createDto };

    jest.spyOn(repository, 'create').mockReturnValue(expectedEntity as any);
    jest.spyOn(repository, 'save').mockResolvedValue(expectedEntity as any);

    const result = await service.create(createDto);
    expect(result).toEqual(expectedEntity);
  });
});
```

## 🎨 Code Quality

### Linting and Formatting
```bash
# Lint and fix code
npm run lint

# Check linting without fixing
npm run lint:check

# Format code
npm run format
```

### Git Hooks
The project uses Husky for Git hooks:
- **Pre-commit**: Runs linting and formatting
- **Pre-push**: Runs tests

### Code Quality Tools
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks management
- **lint-staged**: Run linters on staged files

## 🔧 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Clean start
npm run docker:start:dev:clean

# Check logs
npm run docker:logs:dev

# Rebuild container
npm run docker:build:dev
```

#### Database Issues
```bash
# Reset database
npm run db:reset

# Check migration status
npm run db:show
```

#### Port Already in Use
```bash
# Change PORT in .env file
PORT=3001

# Or kill process using the port
lsof -ti:3000 | xargs kill -9
```

#### Permission Issues
```bash
# Fix Docker permissions
sudo chown -R $USER:$USER .

# Or run Docker with proper permissions
docker-compose -f docker-compose.dev.yml up -d
```

### Debug Mode
```bash
# Start in debug mode
npm run start:debug

# Or with Docker
docker-compose -f docker-compose.dev.yml up api
```

### Environment Variables
Make sure your `.env` file has all required variables:
```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost # overriden in compose file
DB_PORT=54323
DB_USERNAME=postgres # overriden in compose file
DB_PASSWORD=password 
DB_NAME=tx-indexer

# JWT
ACCESS_TOKEN_SECRET=your-super-secret-jwt-key-change-in-production
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-change-in-production
ACCESS_TOKEN_EXPIRATION_TIME_IN_SECONDS=900000
REFRESH_TOKEN_EXPIRATION_TIME_IN_SECONDS=604800000

# Redis
REDIS_URL=redis://localhost:63791 #override in docker compose file
REDIS_HOST=localhost
REDIS_PORT=63791
REDIS_COMMANDER_PORT=8082

SUPER_ADMIN_ADDRESSES=

CRAWLER_NETWORK=sepolia

ETHEREUM_RPC_URLS=
BSC_TESTNET_RPC_URLS=
POLYGON_RPC_URLS=
BSC_RPC_URLS=
SEPOLIA_RPC_URLS=
BSC_TESTNET_RPC_URLS=
SOLANA_RPC_URL=

```

## 📚 Next Steps

1. **Read [Coding Conventions](CONVENTION.md)** for code standards
2. **Explore [Module Structure](MODULE_STRUCTURE_GUIDE.md)** for architecture patterns
3. **Check [Deployment Guide](../DEPLOYMENT.md)** for production setup
4. **Review [Request Lifecycle](REQUEST_LIFECYCLE.md)** for understanding request flow

## 🆘 Getting Help

- Check the troubleshooting section above
- Review the [Coding Conventions](CONVENTION.md)
- Look at existing modules for examples
- Check the API documentation at http://localhost:3000/docs 