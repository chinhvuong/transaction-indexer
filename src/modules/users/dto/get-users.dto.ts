import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { USER_ROLE } from '../types';
import { UserProfileDto } from './user-profile.dto';

// Request DTOs
export class GetUsersQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({
    description: 'Search term for filtering users',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by user role',
    enum: USER_ROLE,
    required: false,
  })
  @IsOptional()
  @IsEnum(USER_ROLE)
  role?: USER_ROLE;

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({
    description: 'Include inactive users',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeInactive?: boolean;

  @ApiProperty({
    description: 'Filter by creation date (from)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdFrom?: string;

  @ApiProperty({
    description: 'Filter by creation date (to)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdTo?: string;
}

// Response DTOs
export class GetUsersResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserProfileDto],
  })
  data: UserProfileDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevPage: boolean;

  @ApiProperty({
    description: 'Applied filters',
    required: false,
  })
  filters?: {
    search?: string;
    role?: USER_ROLE;
    createdFrom?: string;
    createdTo?: string;
  };

  @ApiProperty({
    description: 'Applied sorting',
    required: false,
  })
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}
