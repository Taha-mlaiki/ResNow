import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { Reservation } from './entities/reservation.entity';
import { EventsModule } from '../events/events.module';
import { PdfService } from '../pdf/pdf.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation]), EventsModule],
  providers: [ReservationsService, PdfService],
  controllers: [ReservationsController],
  exports: [ReservationsService],
})
export class ReservationsModule {}
