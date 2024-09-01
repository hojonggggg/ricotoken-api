import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AdminsService } from 'src/domains/admins/admins.service';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private adminsService: AdminsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("::auth > is-admin.guard > canActivate");
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.isAdmin) {
      throw new UnauthorizedException('Access denied from IsAdminGuard');
    }

    //const clientIp = request.ip;
    /*
    const isAllowed = await this.adminsService.isAllowedIp(clientIp);
    
    if (!isAllowed) {
      throw new UnauthorizedException('Access denied from this IP address');
    }
    */

    return true;
  }
}