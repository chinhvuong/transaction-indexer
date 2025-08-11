# Users Module

## 🎯 **Purpose**

The Users Module manages all user-related operations including user CRUD operations, profile management, user search, and user data validation.

## 🏗️ **Architecture**

```
users/
├── constants/           # User-related constants
├── controllers/         # REST API endpoints
├── services/           # Business logic services
├── types/              # TypeScript interfaces and types
├── dto/                # API request/response DTOs
├── errors/             # User-specific error classes
├── entities/           # User entity definition
├── repositories/       # User repository
└── README.md           # This file
```

## 🔧 **Key Components**

### **1. Controllers** (`controllers/`)
- `users.controller.ts` - Main user management endpoints
- Handles CRUD operations, search, profile updates

### **2. Services** (`services/`)
- `users.service.ts` - Main user business logic
- User creation, updates, search, and validation

### **3. Entity** (`entities/`)
- `user.entity.ts` - User database entity
- Defines user schema and relationships

### **4. Repository** (`repositories/`)
- `user.repository.ts` - User data access layer
- Custom queries and data operations

### **5. DTOs** (`dto/`)
- Request and response DTOs for all endpoints
- Validation and Swagger documentation

## 📋 **Available Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users` | Get all users (paginated) | Yes |
| `GET` | `/users/:id` | Get user by ID | Yes |
| `POST` | `/users` | Create new user | Yes (Admin) |
| `PUT` | `/users/:id` | Update user | Yes |
| `DELETE` | `/users/:id` | Delete user | Yes (Admin) |
| `GET` | `/users/search` | Search users | Yes |
| `PUT` | `/users/:id/profile` | Update user profile | Yes |
| `PUT` | `/users/:id/avatar` | Update user avatar | Yes |

## 🚀 **Usage Examples**

### **Get All Users (Paginated)**

```typescript
// GET /users?page=1&limit=10&role=user&status=active
{
  "data": [
    {
      "id": "user-123",
      "email": "john@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "role": "user",
      "status": "active",
      "avatar": "https://example.com/avatar.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### **Create User**

```typescript
// POST /users
{
  "email": "newuser@example.com",
  "password": "Password123!",
  "name": "New User",
  "username": "newuser",
  "role": "user",
  "phone": "+1234567890"
}

// Response
{
  "message": "User created successfully",
  "user": {
    "id": "user-456",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user",
    "status": "active"
  }
}
```

### **Search Users**

```typescript
// GET /users/search?q=john&role=user&status=active
{
  "data": [
    {
      "id": "user-123",
      "email": "john@example.com",
      "name": "John Doe",
      "username": "johndoe",
      "role": "user",
      "status": "active"
    }
  ],
  "total": 1
}
```

## 📝 **How to Add New User Features**

### **1. Add New Endpoint**

```typescript
// controllers/users.controller.ts
@Post(':id/verify-email')
@ApiOperation({ summary: 'Verify user email' })
@ApiResponse({ status: 200, description: 'Email verified successfully' })
async verifyEmail(@Param('id') id: string, @Body() body: VerifyEmailDto) {
  return this.usersService.verifyEmail(id, body.token);
}
```

### **2. Add Service Method**

```typescript
// services/users.service.ts
async verifyEmail(userId: string, token: string) {
  const user = await this.userRepository.findById(userId);
  if (!user) {
    throw Errors.userNotFoundById(userId);
  }

  // Verify token
  const isValidToken = this.jwtService.verify(token, {
    secret: this.configService.get('EMAIL_VERIFICATION_SECRET'),
  });

  if (!isValidToken || isValidToken.sub !== userId) {
    throw Errors.invalidToken();
  }

  // Update user
  await this.userRepository.update(userId, { emailVerified: true });

  return { message: 'Email verified successfully' };
}
```

### **3. Add DTOs**

```typescript
// dto/verify-email.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Email verified successfully'
  })
  message: string;
}
```

### **4. Add Repository Method**

```typescript
// repositories/user.repository.ts
async updateEmailVerification(userId: string, verified: boolean): Promise<void> {
  await this.update(userId, { emailVerified: verified });
}

async findUnverifiedUsers(): Promise<UserEntity[]> {
  return this.find({
    where: { emailVerified: false },
    select: ['id', 'email', 'name', 'createdAt'],
  });
}
```

## 🛡️ **Security Features**

### **1. Role-Based Access Control**
- User roles (user, admin, moderator)
- Route-level authorization
- Resource-level permissions
- Admin-only operations

### **2. Data Validation**
- Input validation with class-validator
- Email format validation
- Password strength requirements
- Username format validation

### **3. Data Protection**
- Password hashing with bcrypt
- Sensitive data filtering in responses
- Audit logging for user changes
- Rate limiting on user operations

### **4. Search Security**
- SQL injection prevention
- Input sanitization
- Result pagination
- Access control on search results

## 🔍 **Error Handling**

### **Common User Errors**

```typescript
import { Errors } from '../shared/errors/simple-errors';

// User not found
throw Errors.userNotFoundById(userId);

// User already exists
throw Errors.userExists(email);

// Username taken
throw Errors.usernameTaken(username);

// Invalid user data
throw Errors.invalidUserData('email');
```

### **Error Response Format**

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID user-123 not found",
    "statusCode": 404,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📊 **User Entity Structure**

```typescript
interface UserEntity {
  id: string;                    // UUID primary key
  email: string;                 // Unique email address
  username?: string;             // Optional unique username
  name: string;                  // Full name
  password: string;              // Hashed password
  phone?: string;                // Optional phone number
  avatar?: string;               // Optional avatar URL
  location?: string;             // Optional location
  role: UserRole;                // User role (user, admin, moderator)
  status: UserStatus;            // User status (active, inactive, suspended, pending)
  emailVerified: boolean;        // Email verification status
  lastLoginAt?: Date;            // Last login timestamp
  createdAt: Date;               // Account creation date
  updatedAt: Date;               // Last update date
}
```

## 🎯 **Best Practices**

### **1. Always Validate Input**
```typescript
// ✅ Good - Use DTOs with validation
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

// ❌ Bad - No validation
async createUser(data: any) {
  // No validation
}
```

### **2. Use Repository Pattern**
```typescript
// ✅ Good - Use repository methods
const user = await this.userRepository.findByEmail(email);

// ❌ Bad - Direct database queries
const user = await this.dataSource.query('SELECT * FROM users WHERE email = ?', [email]);
```

### **3. Implement Proper Error Handling**
```typescript
// ✅ Good - Specific error types
if (!user) {
  throw Errors.userNotFoundById(userId);
}

// ❌ Bad - Generic errors
if (!user) {
  throw new Error('User not found');
}
```

### **4. Use Pagination for Large Datasets**
```typescript
// ✅ Good - Paginated results
async getUsers(page: number = 1, limit: number = 10) {
  return this.userRepository.findUsersWithPagination(page, limit);
}

// ❌ Bad - No pagination
async getUsers() {
  return this.userRepository.find(); // Could return thousands of records
}
```

## 🔄 **Integration with Other Modules**

### **Auth Module Integration**
```typescript
// Use auth guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Post()
async createUser(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### **Queue Module Integration**
```typescript
// Send welcome email via queue
await this.queueService.addEmailJob({
  id: `welcome-${Date.now()}`,
  timestamp: new Date(),
  to: user.email,
  subject: 'Welcome to our platform!',
  template: 'welcome',
  context: { name: user.name }
});
```

### **Repositories Module Integration**
```typescript
// Use user repository from repositories module
constructor(
  private readonly userRepository: UserRepository,
) {}
```

## 📈 **Performance Considerations**

### **1. Database Indexing**
```sql
-- Create indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### **2. Query Optimization**
```typescript
// ✅ Good - Select only needed fields
const users = await this.userRepository.find({
  select: ['id', 'email', 'name', 'role', 'status'],
  where: { status: 'active' },
});

// ❌ Bad - Select all fields
const users = await this.userRepository.find({
  where: { status: 'active' },
});
```

### **3. Caching Strategy**
```typescript
// Cache frequently accessed user data
@CacheKey('user-profile')
@CacheTTL(300) // 5 minutes
async getUserProfile(userId: string) {
  return this.userRepository.findById(userId);
}
```

---

**For more information, see the individual component files and the main application documentation.** 