import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as Moment from 'moment';
import { extendMoment } from 'moment-range';
import { HotelRoomRepository } from './hotel-room.repository';
import { HotelRoomBusyStatusRepository } from './hotel-room-busy.repository';
import { HotelRoom } from './hotel-room.entity';
import { HotelRoomBusyStatus } from './hotel-room-busy.entity';
import { SetRoomBusyStatusDtoBody } from './dto/set-room-busy-status.dto';
import { GetRoomBusyStatusDtoQuery } from './dto/get-room-busy-status.dto';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import * as Bluebird from 'bluebird';
import { HotelRoomStatusEnum } from './hotel-room-status.enum';
const moment = extendMoment(Moment);

@Injectable()
export class HotelService {
  // logger = new Logger('HotelService');
  constructor(
    @InjectRepository(HotelRoomRepository)
    private hotelRoomRepository: HotelRoomRepository,
    @InjectRepository(HotelRoomBusyStatusRepository)
    private hotelRoomBusyStatusRepository: HotelRoomBusyStatusRepository,
  ) {
    // this.createInitialHotelRooms()
    //   .then((rooms) => {
    //     this.logger.log(`Initial rooms (${rooms.length}) created`);
    //   })
    //   .catch((err) => {
    //     this.logger.error(`Cannot create rooms: ${err.toString()}`);
    //   });
  }

  async createInitialHotelRooms(): Promise<HotelRoom[]> {
    const rooms = new Array(10);
    return Bluebird.map(rooms, async (_, roomNumber) => {
      const room = this.hotelRoomRepository.create({
        roomNumber,
        description: `Room ${roomNumber} is the best room in our hotel`,
      });
      await this.hotelRoomRepository.save(room);
      return room;
    });
  }

  async getAllRooms(): Promise<HotelRoom[]> {
    const found = await this.hotelRoomRepository.find({});
    if (!found) {
      return [];
    }
    return found;
  }

  async getRoomById(id: string): Promise<HotelRoom> {
    const found = await this.hotelRoomRepository.findOne({
      where: { id },
      relations: ['busyDates'],
    });
    if (!found) {
      throw new NotFoundException(`Hotel room with id ${id} is not found`);
    }
    return found;
  }

  async getRoomBusyStatus(
    roomId: string,
    getRoomBusyStatusDtoQuery: GetRoomBusyStatusDtoQuery,
  ): Promise<HotelRoomStatusEnum> {
    const checkDate = new Date(getRoomBusyStatusDtoQuery.checkDate);
    const isBusy = await this.hotelRoomBusyStatusRepository.findOne({
      where: {
        room: roomId,
        settlingDate: LessThanOrEqual(checkDate),
        evictionDate: MoreThanOrEqual(checkDate),
      },
    });
    return isBusy ? HotelRoomStatusEnum.OCCUPIED : HotelRoomStatusEnum.FREE;
  }

  async setRoomBusyStatus(
    roomId: string,
    roomBusyStatusDtoBody: SetRoomBusyStatusDtoBody,
  ): Promise<HotelRoomBusyStatus> {
    const settlingDate = new Date(roomBusyStatusDtoBody.settlingDate);
    const evictionDate = new Date(roomBusyStatusDtoBody.evictionDate);
    const newRange = moment.range(settlingDate, evictionDate);
    if (settlingDate >= evictionDate) {
      throw new BadRequestException(`Settling cannot be later than Eviction`);
    }
    const room = await this.getRoomById(roomId);
    const isBusy = room.busyDates
      .map(({ settlingDate, evictionDate }) =>
        moment.range(settlingDate, evictionDate),
      )
      .some((existingRange) => newRange.overlaps(existingRange));
    if (isBusy) {
      throw new ConflictException(
        `This dates are booked already, please try another dates`,
      );
    }
    const hotelRoomBusyStatus = this.hotelRoomBusyStatusRepository.create({
      room: room,
      settlingDate,
      evictionDate,
    });

    return await this.hotelRoomBusyStatusRepository.save(hotelRoomBusyStatus);
  }
}
