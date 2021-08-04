import { Test } from '@nestjs/testing';
import { HotelService } from './hotel.service';
import { HotelRoomRepository } from './hotel-room.repository';
import { HotelRoomBusyStatusRepository } from './hotel-room-busy.repository';
import { INestApplication } from '@nestjs/common';
import { HotelModule } from './hotel.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoom } from './hotel-room.entity';
import * as Bluebird from 'bluebird';
import { HotelRoomStatusEnum } from './hotel-room-status.enum';

const DATABASE_URL = process.env.DATABASE_URL || 'localhost';
const DATABASE_PORT = parseInt(process.env.DATABASE_URL) || 5432;

describe('HotelService', () => {
  //App itself
  let app: INestApplication;
  //Services
  let hotelService: HotelService;
  let hotelRoomRepository: HotelRoomRepository;
  let hotelRoomBusyStatusRepository: HotelRoomBusyStatusRepository;
  //Rooms created for testing
  let rooms: HotelRoom[];

  beforeAll(async () => {
    // Well, actually, testing on a production database is a REEEEEALLY bad idea, but postgres cannot create/remove databases for testing.
    // What a surprise, postgres lovers.
    // MongoDB = OneLove <3
    const module = await Test.createTestingModule({
      imports: [
        HotelModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: DATABASE_URL,
          port: DATABASE_PORT,
          username: 'postgres',
          password: 'postgres',
          database: 'hotel',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    hotelService = module.get(HotelService);
    hotelRoomRepository = module.get(HotelRoomRepository);
    hotelRoomBusyStatusRepository = module.get(HotelRoomBusyStatusRepository);
  });

  afterAll(async () => {
    await Bluebird.map(rooms, async (room) => {
      await hotelRoomBusyStatusRepository.delete({ room: room });
      await hotelRoomRepository.delete(room.id);
    });
    await app.close();
  });

  describe('Rooms', () => {
    it('should be able to create test rooms', async () => {
      rooms = await hotelService.createInitialHotelRooms();
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBe(10);
    });

    it('should be able to get all created rooms', async () => {
      // jest.spyOn(hotelController, 'getAllRooms').mockImplementation(() => result);
      const result = await hotelService.getAllRooms();
      expect(result.length).toBe(10);
    });

    it('should be able to get room by id', async () => {
      const result = await hotelService.getRoomById(rooms[0].id);
      expect(typeof result).toBe('object');
      expect(result.busyDates.length).toBe(0);
      expect(typeof result.description).toBe('string');
    });

    it('should be able to get room busy status', async () => {
      const result = await hotelService.getRoomBusyStatus(rooms[0].id, {
        checkDate: new Date(),
      });
      expect(result).toBe(HotelRoomStatusEnum.FREE);
    });

    it('should be able to set room busy status', async () => {
      const settlingDate = new Date();
      const result = await hotelService.setRoomBusyStatus(rooms[0].id, {
        settlingDate: settlingDate,
        evictionDate: new Date(settlingDate.getTime() + 1000 * 60 * 60 * 24),
      });
      expect(typeof result).toBe('object');
      expect(result.settlingDate instanceof Date).toBe(true);
      expect(result.evictionDate instanceof Date).toBe(true);
      expect(typeof result.id).toBe('string');
    });

    it('should not be able to set room busy status for same time again', async () => {
      try {
        const settlingDate = new Date();
        await hotelService.setRoomBusyStatus(rooms[0].id, {
          settlingDate: settlingDate,
          evictionDate: new Date(settlingDate.getTime() + 1000 * 60 * 60 * 24),
        });
      } catch (e) {
        expect(e.name).toBe('ConflictException');
      }
    });

    it('should be able to get new room busy status', async () => {
      const result = await hotelService.getRoomBusyStatus(rooms[0].id, {
        checkDate: new Date(),
      });
      expect(result).toBe(HotelRoomStatusEnum.OCCUPIED);
    });
  });
});
