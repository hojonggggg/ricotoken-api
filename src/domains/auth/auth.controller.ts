import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: '로그인', description: '관리자 <br/> - type: admin <br/> - email, password 입력 <br/><br/> 사용자 <br/> - type: user <br/> - walletAddress 입력' })
  @ApiResponse({ status: 200 })
  @ApiBody({ type: LoginDto })
  async login(@Request() req, @Body() loginDto: LoginDto) {
    console.log({loginDto});
    return this.authService.login(req.user);
  }
}