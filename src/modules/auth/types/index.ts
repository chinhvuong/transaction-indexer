import { Request } from 'express';
import { USER_ROLE } from '@/modules/users/types';

export interface JwtPayload {
  id: string;
  walletAddress: string;
  role: USER_ROLE;
}

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface RefreshTokenPayload {
  id: string;
  sessionId: string;
}

export type UserForRequest = JwtPayload;

export interface RequestWithUser extends Request {
  user: UserForRequest;
}
