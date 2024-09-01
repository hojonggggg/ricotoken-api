import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // 여기에 로그를 추가
    console.log('JwtAuthGuard: canActivate called');
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
}