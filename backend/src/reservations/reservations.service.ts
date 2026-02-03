import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto';
import { EventsService } from '../events/events.service';
import { EventStatus } from '../events/enums/event-status.enum';
import { ReservationStatus } from './enums/reservation-status.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly eventsService: EventsService,
  ) {}

  /**
   * Create a new reservation
   * @param createReservationDto - DTO containing eventId
   * @param participantId - ID of the user making the reservation
   * @returns Created reservation
   */
  async create(
    createReservationDto: CreateReservationDto,
    participantId: string,
  ): Promise<Reservation> {
    const { eventId } = createReservationDto;

    // Fetch the event
    const event = await this.eventsService.findOne(eventId);

    // Validate event is published
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot reserve for an event that is not published',
      );
    }

    // Validate event is not full
    if (event.reservedCount >= event.capacity) {
      throw new BadRequestException('Event is full');
    }

    // Check for duplicate active reservations
    const existingReservation = await this.reservationRepository.findOne({
      where: {
        participant: { id: participantId },
        event: { id: eventId },
        status: ReservationStatus.PENDING,
      },
    });

    if (existingReservation) {
      throw new BadRequestException(
        'You already have a pending reservation for this event',
      );
    }

    // Create reservation with pending status
    const reservation = this.reservationRepository.create({
      participant: { id: participantId } as any,
      event: { id: eventId } as any,
      status: ReservationStatus.PENDING,
    });

    return this.reservationRepository.save(reservation);
  }

  /**
   * Confirm a reservation (admin only)
   * @param id - Reservation ID
   * @returns Updated reservation
   */
  async confirm(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // Validate reservation is pending
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending reservations can be confirmed',
      );
    }

    // Fetch the event to check capacity
    const event = await this.eventsService.findOne(reservation.event.id);

    // Prevent overbooking
    if (event.reservedCount >= event.capacity) {
      throw new BadRequestException(
        'Cannot confirm reservation - event is full',
      );
    }

    // Update reservation status
    reservation.status = ReservationStatus.CONFIRMED;

    // Update event capacity
    event.reservedCount += 1;
    await this.eventsService.update(event.id, {
      reservedCount: event.reservedCount,
    });

    return this.reservationRepository.save(reservation);
  }

  /**
   * Refuse a reservation (admin only)
   * @param id - Reservation ID
   * @returns Updated reservation
   */
  async refuse(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // Validate reservation is pending
    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException('Only pending reservations can be refused');
    }

    // Update reservation status
    reservation.status = ReservationStatus.REFUSED;

    return this.reservationRepository.save(reservation);
  }
}
