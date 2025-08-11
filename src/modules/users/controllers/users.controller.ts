import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RequestWithUser } from '@/modules/auth/types';
import { UsersService } from '@/modules/users/services/users.service';

import { UserProfileDto } from '@/modules/users/dto/user-profile.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  getProfile(@Req() req: RequestWithUser): UserProfileDto {
    return req.user as unknown as UserProfileDto;
  }
}
