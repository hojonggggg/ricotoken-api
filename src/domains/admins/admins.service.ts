import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllowedIp } from './entities/allowed-ip.entity';
import { AdminLog } from './entities/admin-log.entity';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(AllowedIp)
    private allowedIpsRepository: Repository<AllowedIp>,
    @InjectRepository(AdminLog)
    private adminLogRepository: Repository<AdminLog>
  ) {}

  async addAllowedIp(userId: number, ip: string, adminIp: string): Promise<AllowedIp> {
    ip = "::ffff:" + ip;
    const allowedIp = await this.allowedIpsRepository.save({ userId, ip });
    const action = '아이피 추가';
    const memo = ip;
    await this.logAdminAction(userId, action, adminIp, memo);
    return allowedIp;
  }

  async isAllowedIp(ip: string): Promise<boolean> {
    const allowedIp = await this.allowedIpsRepository.findOne({ where: { ip } });
    return !!allowedIp;
  }

  async getAllAllowedIps(): Promise<AllowedIp[]> {
    const allowedIps = await this.allowedIpsRepository.find({
      select: ['ip']
    });
  
    return allowedIps.map(item => ({
      ...item,
      ip: item.ip.replace(/^::ffff:/, '')
    }));
  }

  async removeAllowedIp(userId: number, id: number, adminIp: string): Promise<void> {
    await this.allowedIpsRepository.delete(id);
    const action = '아이피 삭제';
    const memo = `${id}`;
    await this.logAdminAction(userId, action, adminIp, memo);
  }

  async logAdminAction(userId: number, action: string, ip: string, memo: string): Promise<AdminLog> {
    const log = this.adminLogRepository.create({ userId, action, ip, memo });
    return this.adminLogRepository.save(log);
  }

  async getAdminLogs(paginationQuery): Promise<any> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [logs, total] = await this.adminLogRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}