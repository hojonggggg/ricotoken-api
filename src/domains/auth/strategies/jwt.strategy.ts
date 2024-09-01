import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminsService } from 'src/domains/admins/admins.service';
import { AuthService } from '../auth.service';
import { LoginType } from '../enums/login-type.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private adminsService: AdminsService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true,
    });
  }
  /*
  async validate(req: any, payload: any) {
    if (payload.isAdmin) {
      const isAllowedIp = await this.adminsService.isAllowedIp(req.ip);
      if (!isAllowedIp) {
        throw new UnauthorizedException('Access denied from this IP address');
      }
      return { userId: payload.sub, email: payload.email, isAdmin: payload.isAdmin };
    }
    return { userId: payload.sub, walletAddress: payload.walletAddress, isAdmin: payload.isAdmin };
    
  }
    */
  async validate(
    req: any, 
    email: string,
    password: string,
  ): Promise<any> {
    const { type, walletAddress } = req.body;
    console.log("validate");
    console.log({type, email, password, walletAddress});
    let user;

    if (type === LoginType.ADMIN) {
      user = await this.authService.validateAdmin(email, password);
    } else if (type === LoginType.USER) {
      user = await this.authService.validateUser(walletAddress);
    }

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}