import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateAdmin(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUser(walletAddress: string): Promise<any> {
    const user = await this.usersService.findOneByWalletAddress(walletAddress);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  /*
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
  */

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
    return {
      accessToken: this.jwtService.sign(payload),
      isAdmin: user.isAdmin
    };
  }
}