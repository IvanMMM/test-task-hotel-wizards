import { EntityRepository, Repository } from 'typeorm';
import { HotelRoom } from './hotel-room.entity';

@EntityRepository(HotelRoom)
export class HotelRoomRepository extends Repository<HotelRoom> {}
