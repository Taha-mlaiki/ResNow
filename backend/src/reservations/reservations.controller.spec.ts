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
    confirm: jest.fn(),
    refuse: jest.fn(),
    cancel: jest.fn(),
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

  describe('confirm', () => {
    const reservationId = 'reservation-123';

    it('should confirm a reservation successfully', async () => {
      const confirmedReservation = {
        id: reservationId,
        participant: { id: mockUser.sub },
        event: { id: 'event-123' },
        status: ReservationStatus.CONFIRMED,
      };

      mockReservationsService.confirm = jest
        .fn()
        .mockResolvedValue(confirmedReservation);

      const result = await controller.confirm(reservationId);

      expect(service.confirm).toHaveBeenCalledWith(reservationId);
      expect(result.status).toBe(ReservationStatus.CONFIRMED);
    });

    it('should throw BadRequestException if reservation not found', async () => {
      mockReservationsService.confirm = jest
        .fn()
        .mockRejectedValue(new BadRequestException('Reservation not found'));

      await expect(controller.confirm(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.confirm(reservationId)).rejects.toThrow(
        'Reservation not found',
      );
    });

    it('should throw BadRequestException if reservation is not pending', async () => {
      mockReservationsService.confirm = jest
        .fn()
        .mockRejectedValue(
          new BadRequestException('Only pending reservations can be confirmed'),
        );

      await expect(controller.confirm(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.confirm(reservationId)).rejects.toThrow(
        'Only pending reservations can be confirmed',
      );
    });

    it('should throw BadRequestException if event is full', async () => {
      mockReservationsService.confirm = jest
        .fn()
        .mockRejectedValue(
          new BadRequestException('Cannot confirm reservation - event is full'),
        );

      await expect(controller.confirm(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.confirm(reservationId)).rejects.toThrow(
        'Cannot confirm reservation - event is full',
      );
    });
  });

  describe('refuse', () => {
    const reservationId = 'reservation-123';

    it('should refuse a reservation successfully', async () => {
      const refusedReservation = {
        id: reservationId,
        participant: { id: mockUser.sub },
        event: { id: 'event-123' },
        status: ReservationStatus.REFUSED,
      };

      mockReservationsService.refuse = jest
        .fn()
        .mockResolvedValue(refusedReservation);

      const result = await controller.refuse(reservationId);

      expect(service.refuse).toHaveBeenCalledWith(reservationId);
      expect(result.status).toBe(ReservationStatus.REFUSED);
    });

    it('should throw BadRequestException if reservation not found', async () => {
      mockReservationsService.refuse = jest
        .fn()
        .mockRejectedValue(new BadRequestException('Reservation not found'));

      await expect(controller.refuse(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.refuse(reservationId)).rejects.toThrow(
        'Reservation not found',
      );
    });

    it('should throw BadRequestException if reservation is not pending', async () => {
      mockReservationsService.refuse = jest
        .fn()
        .mockRejectedValue(
          new BadRequestException('Only pending reservations can be refused'),
        );

      await expect(controller.refuse(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.refuse(reservationId)).rejects.toThrow(
        'Only pending reservations can be refused',
      );
    });
  });

  describe('cancel', () => {
    const reservationId = 'reservation-123';

    it('should cancel a reservation successfully', async () => {
      const canceledReservation = {
        id: reservationId,
        participant: { id: mockUser.sub },
        event: { id: 'event-123' },
        status: ReservationStatus.CANCELED,
      };

      mockReservationsService.cancel = jest
        .fn()
        .mockResolvedValue(canceledReservation);

      const result = await controller.cancel(reservationId, mockUser);

      expect(service.cancel).toHaveBeenCalledWith(reservationId, mockUser.sub);
      expect(result.status).toBe(ReservationStatus.CANCELED);
    });

    it('should throw BadRequestException if reservation not found', async () => {
      mockReservationsService.cancel = jest
        .fn()
        .mockRejectedValue(new BadRequestException('Reservation not found'));

      await expect(controller.cancel(reservationId, mockUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.cancel(reservationId, mockUser)).rejects.toThrow(
        'Reservation not found',
      );
    });

    it('should throw BadRequestException if not reservation owner', async () => {
      mockReservationsService.cancel = jest
        .fn()
        .mockRejectedValue(
          new BadRequestException('You can only cancel your own reservations'),
        );

      await expect(controller.cancel(reservationId, mockUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.cancel(reservationId, mockUser)).rejects.toThrow(
        'You can only cancel your own reservations',
      );
    });

    it('should throw BadRequestException if reservation cannot be canceled', async () => {
      mockReservationsService.cancel = jest
        .fn()
        .mockRejectedValue(
          new BadRequestException(
            'Only pending or confirmed reservations can be canceled',
          ),
        );

      await expect(controller.cancel(reservationId, mockUser)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.cancel(reservationId, mockUser)).rejects.toThrow(
        'Only pending or confirmed reservations can be canceled',
      );
    });
  });
});
