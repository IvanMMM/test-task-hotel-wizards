import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetRoomBusyStatusDtoQuery {
  @IsDateString()
  @ApiProperty({
    description: 'Expected settling date',
    default: new Date().toISOString(),
  })
  checkDate: Date;
}
