import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard: canActivate called');

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      console.log('Token found:', token);
      try {
        const decoded = this.jwtService.decode(token);
        console.log('Decoded token:', decoded);
      } catch (error) {
        console.error('Error decoding token:', error.message);
      }
    } else {
      console.log('No token found in the request');
    }

    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // 여기에 로그를 추가
    console.log('JwtAuthGuard: handleRequest called', { user });
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}