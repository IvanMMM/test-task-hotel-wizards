import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { HotelRoom } from './hotel-room.entity';

@Entity()
export class HotelRoomBusyStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  //14:00
  settlingDate: Date;
  @Column()
  //12:00
  evictionDate: Date;
  @ManyToOne(() => HotelRoom, (hotelRoom) => hotelRoom.busyDates)
  room: HotelRoom;
}
