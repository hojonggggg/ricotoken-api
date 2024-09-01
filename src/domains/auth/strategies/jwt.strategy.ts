import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminsService } from 'src/domains/admins/admins.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private adminsService: AdminsService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }
  
  async validate(req: any, payload: any) {
    console.log({payload});
    console.log(req.ip);
    if (payload.isAdmin) {
      const isAllowedIp = await this.adminsService.isAllowedIp(req.ip);
      if (!isAllowedIp) {
        throw new UnauthorizedException('Access denied from this IP address');
      }
      return { userId: payload.sub, email: payload.email, isAdmin: payload.isAdmin };
    }
    return { userId: payload.sub, walletAddress: payload.walletAddress, isAdmin: payload.isAdmin };
    
  }
}