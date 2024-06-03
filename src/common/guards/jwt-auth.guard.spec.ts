import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({});
    jwtAuthGuard = new JwtAuthGuard(jwtService);
  });

  it('should return true if the JWT token is valid', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer valid_token',
      },
    } as Request;

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValueOnce({ userId: 1 });

    expect(await jwtAuthGuard.canActivate(mockContext)).toBe(true);
    expect(mockRequest['user']).toEqual({ userId: 1 });
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    const mockRequest = {
      headers: {},
    } as Request;

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if the token is invalid', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer invalid_token',
      },
    } as Request;

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValueOnce(new Error('Invalid token'));

    await expect(jwtAuthGuard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
