import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { HotelRoom } from './hotel-room.entity';
import { HotelService } from './hotel.service';
import { SetRoomBusyStatusDtoBody } from './dto/set-room-busy-status.dto';
import { HotelRoomBusyStatus } from './hotel-room-busy.entity';
import { GetRoomBusyStatusDtoQuery } from './dto/get-room-busy-status.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('hotel')
@ApiTags('hotel')
export class HotelController {
  constructor(private hotelService: HotelService) {}

  @Get('/')
  @ApiResponse({
    status: 200,
    description: 'Rooms list returned successfully',
  })
  /**
   * Get all rooms list
   */
  async getAllRooms(): Promise<HotelRoom[]> {
    return this.hotelService.getAllRooms();
  }

  @Get('/:roomId')
  @ApiResponse({
    status: 200,
    description: 'Room id info returned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Room id is not found',
  })
  async getRoomById(@Param('roomId') roomId: string): Promise<HotelRoom> {
    return this.hotelService.getRoomById(roomId);
  }

  @Get('/:roomId/busy')
  @ApiResponse({
    status: 200,
    description: 'Room id busy status returned successfully',
  })
  async getRoomBusyStatus(
    @Param('roomId') roomId: string,
    @Query() getRoomBusyStatusDtoQuery: GetRoomBusyStatusDtoQuery,
  ) {
    return this.hotelService.getRoomBusyStatus(
      roomId,
      getRoomBusyStatusDtoQuery,
    );
  }

  @Post('/:roomId/busy')
  @ApiResponse({
    status: 201,
    description: 'New busy record created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Room id is not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Selected dates are not available',
  })
  async setRoomBusyStatus(
    @Param('roomId') roomId: string,
    @Body() setRoomBusyStatusDtoBody: SetRoomBusyStatusDtoBody,
  ): Promise<HotelRoomBusyStatus> {
    return this.hotelService.setRoomBusyStatus(
      roomId,
      setRoomBusyStatusDtoBody,
    );
  }
}
