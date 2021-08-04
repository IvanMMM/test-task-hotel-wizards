import { IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetRoomBusyStatusDtoBody {
  @IsDateString()
  @ApiProperty({
    description: 'Wanted settling date',
    default: new Date().toISOString(),
  })
  settlingDate: Date;

  @IsDateString()
  @ApiProperty({
    description: 'Wanted eviction date',
    default: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  })
  evictionDate: Date;
}
