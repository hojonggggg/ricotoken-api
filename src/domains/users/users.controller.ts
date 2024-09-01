import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminRoute } from '../../commons/decorators/admin-route.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @AdminRoute()
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 생성' })
  @ApiResponse({ status: 201, type: User })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @AdminRoute()
  @ApiBearerAuth()
  @ApiOperation({ summary: '전체 사용자 조회' })
  @ApiResponse({ status: 200, type: [User] })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '특정 사용자 조회' })
  @ApiResponse({ status: 200, type: User })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 패스워드 변경' })
  @ApiResponse({ status: 200, type: User })
  async update(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    const userId = req.user.userId;
    return this.usersService.update(+userId, updateUserDto);
  }
  /*
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @AdminRoute()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'The user has been successfully deleted.' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
  */
}