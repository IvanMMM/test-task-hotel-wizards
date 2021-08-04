import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelModule } from './hotel/hotel.module';

const DATABASE_URL = process.env.DATABASE_URL || 'localhost';
const DATABASE_PORT = parseInt(process.env.DATABASE_URL) || 5432;

@Module({
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
  controllers: [],
  providers: [],
})
export class AppModule {}
