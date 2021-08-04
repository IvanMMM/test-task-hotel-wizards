import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { HotelRoomBusyStatus } from './hotel-room-busy.entity';

@Entity()
export class HotelRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ unique: true })
  roomNumber: number;
  @Column()
  description: string;
  @OneToMany(() => HotelRoomBusyStatus, (busyDates) => busyDates.room)
  busyDates: HotelRoomBusyStatus[];
}
