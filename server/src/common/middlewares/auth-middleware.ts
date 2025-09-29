import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Validates JWT tokens and attaches user information to the request
 * Authorization logic is handled at the service layer, not in this middleware
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
      
      // Attach the user info to the request object
      request['user'] = payload;
      
      // Return true to allow the request to proceed
      return true;
    } catch (error) {
      // Any JWT verification error results in unauthorized exception
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}