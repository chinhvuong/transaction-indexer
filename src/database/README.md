# Database Management

This directory contains database migrations and seeds for the NestJS Backend Boilerplate. Seeds are treated as migrations and follow the same execution pattern.

## 📁 **Folder Structure**

```
src/database/
├── migrations/          # Database schema migrations
├── seeds/              # Database seed migrations (treated as migrations)
└── README.md          # This file
```

## 🚀 **Available Scripts**

### **Migration & Seed Commands**

```bash
# Generate a new migration based on entity changes
npm run db:generate --name=<migration-name>

# Create an empty migration file
npm run db:create src/database/migrations/<migration-name>

# Run all pending migrations and seeds
npm run db:run

# Revert the last migration/seed
npm run db:revert

# Show migration/seed status
npm run db:show

# Reset database (revert + run all migrations and seeds)
npm run db:reset
```

## 📝 **Migration Files**

### **Naming Convention**
- Format: `YYYYMMDDHHMMSS-description.ts`
- Example: `20240101120000-create-users-table.ts`

### **Structure**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable20240101120000 implements MigrationInterface {
  name = 'CreateUsersTable20240101120000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "password" character varying NOT NULL,
        "role" character varying NOT NULL DEFAULT 'USER',
        "status" character varying NOT NULL DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

## 🌱 **Seed Files (Migration Style)**

### **Naming Convention**
- Format: `001-description.ts`, `002-description.ts`, etc.
- Executed in alphabetical order (like migrations)
- Use numbers to control execution order

### **Structure**
```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SampleUsers001 implements MigrationInterface {
  name = 'SampleUsers001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🌱 Starting sample users seed...');
    
    try {
      // Check if data already exists
      const existingUsers = await queryRunner.query('SELECT COUNT(*) FROM users');
      if (parseInt(existingUsers[0].count) > 0) {
        console.log('⚠️  Users already exist, skipping seed');
        return;
      }

      // Create seed data
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      
      await queryRunner.query(`
        INSERT INTO users (id, email, name, username, password, role, status, "createdAt", "updatedAt")
        VALUES 
        (uuid_generate_v4(), 'admin@example.com', 'Admin User', 'admin', $1, $2, $3, NOW(), NOW())
      `, [hashedPassword, 'ADMIN', 'ACTIVE']);
      
      console.log('✅ Sample users seed completed successfully');
    } catch (error) {
      console.error('❌ Error in sample users seed:', error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🗑️  Reverting sample users seed...');
    
    try {
      await queryRunner.query(`
        DELETE FROM users 
        WHERE email IN ('admin@example.com')
      `);
      
      console.log('✅ Sample users seed reverted successfully');
    } catch (error) {
      console.error('❌ Error reverting sample users seed:', error);
      throw error;
    }
  }
}
```

## 🔄 **Workflow Examples**

### **1. Setting up a new feature**

```bash
# 1. Create migration for new table
npm run db:generate create-posts-table

# 2. Create seed for sample data
npm run db:create src/database/seeds/002-sample-posts

# 3. Run all migrations and seeds
npm run db:run
```

### **2. Resetting database**

```bash
# Revert all migrations and seeds, then run them again
npm run db:reset
```

### **3. Adding new seed data**

```bash
# Create new seed file
npm run db:create src/database/seeds/003-sample-categories

# Edit the generated file
# Run all migrations and seeds
npm run db:run
```

## ⚠️ **Important Notes**

### **Execution Order**
- Both migrations and seeds are executed in timestamp order
- Seeds are treated exactly like migrations
- Use numbered prefixes (001-, 002-, etc.) to control order
- Never modify existing migration/seed files in production

### **Seed Best Practices**
- Seeds should be idempotent (safe to run multiple times)
- Always check for existing data before inserting
- Include proper `up` and `down` methods
- Use parameterized queries for security

### **Environment**
- Ensure your `.env` file has correct database credentials
- Test migrations and seeds in development before production
- Always backup production database before running migrations

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Migration/Seed already exists**
   ```bash
   # Check existing migrations and seeds
   npm run db:show
   ```

2. **Seed fails to run**
   ```bash
   # Check if database is connected
   # Verify table exists before seeding
   # Check console for specific error messages
   ```

3. **TypeORM connection issues**
   ```bash
   # Verify database credentials in .env
   # Check if database server is running
   # Ensure database exists
   ```

### **Useful Commands**

```bash
# Check migration/seed status
npm run db:show

# View database logs
# Check your application logs for detailed error messages

# Reset everything (development only)
npm run db:reset
```

## 📚 **Best Practices**

1. **Migrations**
   - Keep migrations small and focused
   - Test migrations on development data
   - Include both `up` and `down` methods
   - Use descriptive names

2. **Seeds**
   - Make seeds idempotent
   - Use realistic test data
   - Include data validation
   - Handle existing data gracefully
   - Use parameterized queries

3. **Version Control**
   - Commit migration and seed files
   - Document schema changes
   - Review migration files before committing
   - Keep seeds and migrations in separate folders for clarity 