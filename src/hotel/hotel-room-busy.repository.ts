import { EntityRepository, Repository } from 'typeorm';
import { HotelRoomBusyStatus } from './hotel-room-busy.entity';

@EntityRepository(HotelRoomBusyStatus)
export class HotelRoomBusyStatusRepository extends Repository<HotelRoomBusyStatus> {}
