import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from '../events/events.service';
import { BadRequestException } from '@nestjs/common';
import { EventStatus } from '../events/enums/event-status.enum';
import { ReservationStatus } from './enums/reservation-status.enum';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let repository: Repository<Reservation>;
  let eventsService: EventsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEventsService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockRepository,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    repository = module.get<Repository<Reservation>>(
      getRepositoryToken(Reservation),
    );
    eventsService = module.get<EventsService>(EventsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createReservationDto = { eventId: 'event-123' };
    const participantId = 'user-123';

    const publishedEvent = {
      id: 'event-123',
      title: 'Test Event',
      status: EventStatus.PUBLISHED,
      capacity: 10,
      reservedCount: 5,
    };

    it('should create a reservation successfully', async () => {
      mockEventsService.findOne.mockResolvedValue(publishedEvent);
      mockRepository.findOne.mockResolvedValue(null); // No existing reservation
      mockRepository.create.mockReturnValue({
        participant: { id: participantId },
        event: { id: createReservationDto.eventId },
        status: ReservationStatus.PENDING,
      });
      mockRepository.save.mockResolvedValue({
        id: 'reservation-123',
        participant: { id: participantId },
        event: publishedEvent,
        status: ReservationStatus.PENDING,
      });

      const result = await service.create(createReservationDto, participantId);

      expect(eventsService.findOne).toHaveBeenCalledWith(
        createReservationDto.eventId,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          participant: { id: participantId },
          event: { id: createReservationDto.eventId },
          status: ReservationStatus.PENDING,
        },
      });
      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(result.status).toBe(ReservationStatus.PENDING);
    });

    it('should throw BadRequestException if event is not published', async () => {
      const draftEvent = { ...publishedEvent, status: EventStatus.DRAFT };
      mockEventsService.findOne.mockResolvedValue(draftEvent);

      await expect(
        service.create(createReservationDto, participantId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(createReservationDto, participantId),
      ).rejects.toThrow('Cannot reserve for an event that is not published');
    });

    it('should throw BadRequestException if event is canceled', async () => {
      const canceledEvent = { ...publishedEvent, status: EventStatus.CANCELED };
      mockEventsService.findOne.mockResolvedValue(canceledEvent);

      await expect(
        service.create(createReservationDto, participantId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(createReservationDto, participantId),
      ).rejects.toThrow('Cannot reserve for an event that is not published');
    });

    it('should throw BadRequestException if event is full', async () => {
      const fullEvent = { ...publishedEvent, reservedCount: 10 }; // capacity = 10
      mockEventsService.findOne.mockResolvedValue(fullEvent);

      await expect(
        service.create(createReservationDto, participantId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(createReservationDto, participantId),
      ).rejects.toThrow('Event is full');
    });

    it('should throw BadRequestException if duplicate pending reservation exists', async () => {
      mockEventsService.findOne.mockResolvedValue(publishedEvent);
      mockRepository.findOne.mockResolvedValue({
        id: 'existing-reservation',
        participant: { id: participantId },
        event: { id: createReservationDto.eventId },
        status: ReservationStatus.PENDING,
      });

      await expect(
        service.create(createReservationDto, participantId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(createReservationDto, participantId),
      ).rejects.toThrow(
        'You already have a pending reservation for this event',
      );
    });
  });

  describe('confirm', () => {
    const reservationId = 'reservation-123';
    const pendingReservation = {
      id: reservationId,
      participant: { id: 'user-123' },
      event: { id: 'event-123' },
      status: ReservationStatus.PENDING,
    };

    const event = {
      id: 'event-123',
      title: 'Test Event',
      capacity: 10,
      reservedCount: 5,
    };

    it('should confirm a reservation successfully', async () => {
      mockRepository.findOne.mockResolvedValue({ ...pendingReservation });
      mockEventsService.findOne.mockResolvedValue(event);
      mockEventsService.update = jest.fn().mockResolvedValue(event);
      mockRepository.save.mockResolvedValue({
        ...pendingReservation,
        status: ReservationStatus.CONFIRMED,
      });

      const result = await service.confirm(reservationId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
      expect(eventsService.findOne).toHaveBeenCalledWith(
        pendingReservation.event.id,
      );
      expect(eventsService.update).toHaveBeenCalledWith(event.id, {
        reservedCount: 6,
      });
      expect(result.status).toBe(ReservationStatus.CONFIRMED);
    });

    it('should throw BadRequestException if reservation not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.confirm(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm(reservationId)).rejects.toThrow(
        'Reservation not found',
      );
    });

    it('should throw BadRequestException if reservation is not pending', async () => {
      const confirmedReservation = {
        ...pendingReservation,
        status: ReservationStatus.CONFIRMED,
      };
      mockRepository.findOne.mockResolvedValue(confirmedReservation);

      await expect(service.confirm(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm(reservationId)).rejects.toThrow(
        'Only pending reservations can be confirmed',
      );
    });

    it('should throw BadRequestException if event is full', async () => {
      const fullEvent = { ...event, reservedCount: 10 }; // capacity = 10
      mockRepository.findOne.mockResolvedValue({ ...pendingReservation });
      mockEventsService.findOne.mockResolvedValue(fullEvent);

      await expect(service.confirm(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirm(reservationId)).rejects.toThrow(
        'Cannot confirm reservation - event is full',
      );
    });
  });

  describe('refuse', () => {
    const reservationId = 'reservation-123';
    const pendingReservation = {
      id: reservationId,
      participant: { id: 'user-123' },
      event: { id: 'event-123' },
      status: ReservationStatus.PENDING,
    };

    it('should refuse a reservation successfully', async () => {
      mockRepository.findOne.mockResolvedValue(pendingReservation);
      mockRepository.save.mockResolvedValue({
        ...pendingReservation,
        status: ReservationStatus.REFUSED,
      });

      const result = await service.refuse(reservationId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
      expect(result.status).toBe(ReservationStatus.REFUSED);
    });

    it('should throw BadRequestException if reservation not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.refuse(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.refuse(reservationId)).rejects.toThrow(
        'Reservation not found',
      );
    });

    it('should throw BadRequestException if reservation is not pending', async () => {
      const refusedReservation = {
        ...pendingReservation,
        status: ReservationStatus.REFUSED,
      };
      mockRepository.findOne.mockResolvedValue(refusedReservation);

      await expect(service.refuse(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.refuse(reservationId)).rejects.toThrow(
        'Only pending reservations can be refused',
      );
    });
  });

  describe('cancel', () => {
    const reservationId = 'reservation-123';
    const participantId = 'user-123';
    const pendingReservation = {
      id: reservationId,
      participant: { id: participantId },
      event: { id: 'event-123' },
      status: ReservationStatus.PENDING,
    };

    const confirmedReservation = {
      ...pendingReservation,
      status: ReservationStatus.CONFIRMED,
    };

    const event = {
      id: 'event-123',
      title: 'Test Event',
      capacity: 10,
      reservedCount: 5,
    };

    it('should cancel a pending reservation successfully', async () => {
      mockRepository.findOne.mockResolvedValue(pendingReservation);
      mockRepository.save.mockResolvedValue({
        ...pendingReservation,
        status: ReservationStatus.CANCELED,
      });

      const result = await service.cancel(reservationId, participantId);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
      expect(result.status).toBe(ReservationStatus.CANCELED);
      // Should not update event capacity for pending reservations
      expect(eventsService.update).not.toHaveBeenCalled();
    });

    it('should cancel a confirmed reservation and decrement capacity', async () => {
      mockRepository.findOne.mockResolvedValue(confirmedReservation);
      mockEventsService.findOne.mockResolvedValue(event);
      mockEventsService.update.mockResolvedValue(event);
      mockRepository.save.mockResolvedValue({
        ...confirmedReservation,
        status: ReservationStatus.CANCELED,
      });

      const result = await service.cancel(reservationId, participantId);

      expect(eventsService.findOne).toHaveBeenCalledWith(
        confirmedReservation.event.id,
      );
      expect(eventsService.update).toHaveBeenCalledWith(event.id, {
        reservedCount: 4,
      });
      expect(result.status).toBe(ReservationStatus.CANCELED);
    });

    it('should throw BadRequestException if reservation not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.cancel(reservationId, participantId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(reservationId, participantId),
      ).rejects.toThrow('Reservation not found');
    });

    it('should throw BadRequestException if not reservation owner', async () => {
      mockRepository.findOne.mockResolvedValue(pendingReservation);

      await expect(
        service.cancel(reservationId, 'different-user-id'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(reservationId, 'different-user-id'),
      ).rejects.toThrow('You can only cancel your own reservations');
    });

    it('should throw BadRequestException if reservation is refused', async () => {
      const refusedReservation = {
        ...pendingReservation,
        status: ReservationStatus.REFUSED,
      };
      mockRepository.findOne.mockResolvedValue(refusedReservation);

      await expect(
        service.cancel(reservationId, participantId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(reservationId, participantId),
      ).rejects.toThrow(
        'Only pending or confirmed reservations can be canceled',
      );
    });

    it('should throw BadRequestException if reservation is already canceled', async () => {
      const canceledReservation = {
        ...pendingReservation,
        status: ReservationStatus.CANCELED,
      };
      mockRepository.findOne.mockResolvedValue(canceledReservation);

      await expect(
        service.cancel(reservationId, participantId),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.cancel(reservationId, participantId),
      ).rejects.toThrow(
        'Only pending or confirmed reservations can be canceled',
      );
    });
  });
});
