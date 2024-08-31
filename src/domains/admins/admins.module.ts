import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { AllowedIp } from './entities/allowed-ip.entity';
import { AdminLog } from './entities/admin-log.entity';
import { AdminIpGuard } from './guards/admin-ip.guard';

@Module({
  imports: [TypeOrmModule.forFeature([AllowedIp, AdminLog])],
  controllers: [AdminsController],
  providers: [AdminsService, AdminIpGuard],
  exports: [AdminsService, AdminIpGuard],
})
export class AdminsModule {}