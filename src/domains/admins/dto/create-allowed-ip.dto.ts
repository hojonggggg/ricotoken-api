import { IsIP, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAllowedIpDto {
  @ApiProperty({
    example: '192.168.1.1',
    description: '허용할 IP 주소',
  })
  @IsNotEmpty({ message: 'IP 주소는 필수입니다.' })
  @IsIP(4, { message: '유효한 IPv4 주소를 입력해주세요.' })
  ip: string;
}