// Import user types from entities
import {
  UserEntity,
  USER_ROLE,
  USER_STATUS,
} from '@/modules/users/entities/user.entity';

// Re-export for convenience
export { UserEntity, USER_ROLE, USER_STATUS };

// User-specific types
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: USER_ROLE;
  status: USER_STATUS;
  avatar?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSearchFilters {
  role?: USER_ROLE;
  status?: USER_STATUS;
  search?: string;
}

export interface UserPaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
