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
});
