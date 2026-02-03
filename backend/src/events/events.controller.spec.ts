import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventStatus } from './enums/event-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Test Description',
      startDate: new Date(Date.now() + 86400000).toISOString(),
      endDate: new Date(Date.now() + 172800000).toISOString(),
      location: 'Test Location',
      capacity: 100,
    };

    const mockUser = {
      sub: 'user-123',
      email: 'admin@example.com',
      role: 'Admin',
    };

    it('should create an event', async () => {
      const expectedEvent = {
        id: 'event-123',
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        createdById: mockUser.sub,
        status: EventStatus.DRAFT,
        reservedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEventsService.create.mockResolvedValue(expectedEvent);

      const result = await controller.create(createEventDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createEventDto, mockUser.sub);
      expect(result).toEqual(expectedEvent);
      expect(result.status).toBe(EventStatus.DRAFT);
    });

    it('should extract user ID from authenticated user', async () => {
      const expectedEvent = {
        id: 'event-123',
        createdById: mockUser.sub,
      };

      mockEventsService.create.mockResolvedValue(expectedEvent);

      await controller.create(createEventDto, mockUser);

      expect(service.create).toHaveBeenCalledWith(createEventDto, mockUser.sub);
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Event 1',
          status: EventStatus.PUBLISHED,
          createdBy: { id: 'user-1', email: 'user1@example.com' },
        },
        {
          id: 'event-2',
          title: 'Event 2',
          status: EventStatus.DRAFT,
          createdBy: { id: 'user-2', email: 'user2@example.com' },
        },
      ];

      mockEventsService.findAll.mockResolvedValue(mockEvents);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockEvents);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no events exist', async () => {
      mockEventsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an event by ID', async () => {
      const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        status: EventStatus.PUBLISHED,
        createdBy: { id: 'user-1', email: 'user1@example.com' },
      };

      mockEventsService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOne('event-123');

      expect(service.findOne).toHaveBeenCalledWith('event-123');
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventsService.findOne.mockRejectedValue(
        new NotFoundException('Event with ID non-existent not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const updateEventDto: UpdateEventDto = {
      title: 'Updated Title',
      status: EventStatus.PUBLISHED,
    };

    it('should update an event', async () => {
      const updatedEvent = {
        id: 'event-123',
        title: 'Updated Title',
        status: EventStatus.PUBLISHED,
        createdBy: { id: 'user-1', email: 'user1@example.com' },
      };

      mockEventsService.update.mockResolvedValue(updatedEvent);

      const result = await controller.update('event-123', updateEventDto);

      expect(service.update).toHaveBeenCalledWith('event-123', updateEventDto);
      expect(result).toEqual(updatedEvent);
      expect(result.title).toBe('Updated Title');
      expect(result.status).toBe(EventStatus.PUBLISHED);
    });

    it('should support partial updates', async () => {
      const partialUpdate: UpdateEventDto = {
        description: 'Updated Description Only',
      };

      const updatedEvent = {
        id: 'event-123',
        title: 'Original Title',
        description: 'Updated Description Only',
      };

      mockEventsService.update.mockResolvedValue(updatedEvent);

      const result = await controller.update('event-123', partialUpdate);

      expect(service.update).toHaveBeenCalledWith('event-123', partialUpdate);
      expect(result.description).toBe('Updated Description Only');
    });

    it('should throw NotFoundException if event not found', async () => {
      mockEventsService.update.mockRejectedValue(
        new NotFoundException('Event with ID non-existent not found'),
      );

      await expect(
        controller.update('non-existent', updateEventDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
