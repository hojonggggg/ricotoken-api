import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminsService } from 'src/domains/admins/admins.service';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private adminsService: AdminsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.isAdmin) {
      throw new UnauthorizedException('Access denied from IsAdminGuard');
    }

    const clientIp = request.ip;
    return this.adminsService.isAllowedIp(clientIp);
  }
}