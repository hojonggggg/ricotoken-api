import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminsService } from '../admins.service';

@Injectable()
export class AdminIpGuard implements CanActivate {
  constructor(private adminsService: AdminsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.isAdmin) {
      return false;
    }

    const clientIp = request.ip;
    const isAllowed = await this.adminsService.isAllowedIp(clientIp);
    
    if (!isAllowed) {
      throw new UnauthorizedException('Access denied from this IP address');
    }

    return true;
  }
}