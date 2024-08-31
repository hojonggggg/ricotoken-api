import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginType } from '../enums/login-type.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  /*
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
  */
  async validate(
    req: any, 
    email: string,
    password: string
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