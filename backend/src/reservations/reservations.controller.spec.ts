import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto';
import { ReservationStatus } from './enums/reservation-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let service: ReservationsService;

  const mockReservationsService = {
    create: jest.fn(),
  };

  const mockUser = {
    sub: 'user-123',
    email: 'user@example.com',
    role: 'Participant',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    service = module.get<ReservationsService>(ReservationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createReservationDto: CreateReservationDto = {
      eventId: 'event-123',
    };

    it('should create a reservation successfully', async () => {
      const expectedReservation = {
        id: 'reservation-123',
        participant: { id: mockUser.sub, email: mockUser.email },
        event: { id: createReservationDto.eventId, title: 'Test Event' },
        status: ReservationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockReservationsService.create.mockResolvedValue(expectedReservation);

      const result = await controller.create(createReservationDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(
        createReservationDto,
        mockUser.sub,
      );
      expect(result).toEqual(expectedReservation);
      expect(result.status).toBe(ReservationStatus.PENDING);
    });

    it('should throw BadRequestException if event is not published', async () => {
      mockReservationsService.create.mockRejectedValue(
        new BadRequestException(
          'Cannot reserve for an event that is not published',
        ),
      );

      await expect(
        controller.create(createReservationDto, mockUser),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.create(createReservationDto, mockUser),
      ).rejects.toThrow('Cannot reserve for an event that is not published');
    });

    it('should throw BadRequestException if event is full', async () => {
      mockReservationsService.create.mockRejectedValue(
        new BadRequestException('Event is full'),
      );

      await expect(
        controller.create(createReservationDto, mockUser),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.create(createReservationDto, mockUser),
      ).rejects.toThrow('Event is full');
    });

    it('should throw BadRequestException if duplicate reservation exists', async () => {
      mockReservationsService.create.mockRejectedValue(
        new BadRequestException(
          'You already have a pending reservation for this event',
        ),
      );

      await expect(
        controller.create(createReservationDto, mockUser),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.create(createReservationDto, mockUser),
      ).rejects.toThrow(
        'You already have a pending reservation for this event',
      );
    });

    it('should throw NotFoundException if event does not exist', async () => {
      mockReservationsService.create.mockRejectedValue(
        new NotFoundException('Event not found'),
      );

      await expect(
        controller.create(createReservationDto, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
