import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Validates JWT tokens and ensures users can only access their own resources
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract and validate token
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Verify token and store user payload
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload;
      
      // Ensure user is accessing own resources
      // Get requested user ID from params or body
      const requestedUserId = request.params.id || request.body.user_id;
      
      // If a specific user is being targeted, verify it matches authenticated user
      if (requestedUserId && payload.sub !== parseInt(requestedUserId)) {
        throw new ForbiddenException('You can only access your own resources');
      }
      
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error; // Re-throw authorization errors
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}