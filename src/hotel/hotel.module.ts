import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoomRepository } from './hotel-room.repository';
import { HotelRoomBusyStatusRepository } from './hotel-room-busy.repository';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HotelRoomRepository,
      HotelRoomBusyStatusRepository,
    ]),
  ],
  controllers: [HotelController],
  providers: [HotelService],
})
export class HotelModule {}
