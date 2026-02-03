import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventStatus } from './enums/event-status.enum';

describe('EventsService', () => {
  let service: EventsService;
  let repository: Repository<Event>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Test Description',
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      location: 'Test Location',
      capacity: 100,
    };
    const createdById = 'user-123';

    it('should create an event successfully', async () => {
      const expectedEvent = {
        id: 'event-123',
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        createdById,
        status: EventStatus.DRAFT,
        reservedCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(expectedEvent);
      mockRepository.save.mockResolvedValue(expectedEvent);

      const result = await service.create(createEventDto, createdById);

      expect(repository.create).toHaveBeenCalledWith({
        ...createEventDto,
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        createdById,
        status: EventStatus.DRAFT,
        reservedCount: 0,
      });
      expect(repository.save).toHaveBeenCalledWith(expectedEvent);
      expect(result).toEqual(expectedEvent);
      expect(result.status).toBe(EventStatus.DRAFT);
      expect(result.reservedCount).toBe(0);
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      const invalidDto = {
        ...createEventDto,
        startDate: new Date(Date.now() + 172800000).toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      await expect(service.create(invalidDto, createdById)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto, createdById)).rejects.toThrow(
        'End date must be after start date',
      );
    });

    it('should throw BadRequestException if start date is in the past', async () => {
      const invalidDto = {
        ...createEventDto,
        startDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        endDate: new Date(Date.now() + 86400000).toISOString(),
      };

      await expect(service.create(invalidDto, createdById)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(invalidDto, createdById)).rejects.toThrow(
        'Start date cannot be in the past',
      );
    });
  });

  describe('findAll', () => {
    it('should return all events with creator relation', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          title: 'Event 1',
          startDate: new Date(),
          createdBy: { id: 'user-1', email: 'user1@example.com' },
        },
        {
          id: 'event-2',
          title: 'Event 2',
          startDate: new Date(),
          createdBy: { id: 'user-2', email: 'user2@example.com' },
        },
      ];

      mockRepository.find.mockResolvedValue(mockEvents);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['createdBy'],
        order: { startDate: 'ASC' },
      });
      expect(result).toEqual(mockEvents);
    });
  });

  describe('findPublished', () => {
    it('should return only published events', async () => {
      const publishedEvents = [
        {
          id: 'event-1',
          title: 'Published Event 1',
          status: EventStatus.PUBLISHED,
          startDate: new Date(),
          createdBy: { id: 'user-1', email: 'user1@example.com' },
        },
        {
          id: 'event-2',
          title: 'Published Event 2',
          status: EventStatus.PUBLISHED,
          startDate: new Date(),
          createdBy: { id: 'user-2', email: 'user2@example.com' },
        },
      ];

      mockRepository.find.mockResolvedValue(publishedEvents);

      const result = await service.findPublished();

      expect(repository.find).toHaveBeenCalledWith({
        where: { status: EventStatus.PUBLISHED },
        relations: ['createdBy'],
        order: { startDate: 'ASC' },
      });
      expect(result).toEqual(publishedEvents);
      expect(result).toHaveLength(2);
      expect(
        result.every((event) => event.status === EventStatus.PUBLISHED),
      ).toBe(true);
    });

    it('should return empty array if no published events exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findPublished();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return an event by ID', async () => {
      const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        createdBy: { id: 'user-1', email: 'user1@example.com' },
      };

      mockRepository.findOne.mockResolvedValue(mockEvent);

      const result = await service.findOne('event-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'event-123' },
        relations: ['createdBy'],
      });
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if event not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Event with ID non-existent not found',
      );
    });
  });

  describe('update', () => {
    const existingEvent = {
      id: 'event-123',
      title: 'Original Title',
      description: 'Original Description',
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 172800000),
      location: 'Original Location',
      capacity: 100,
      reservedCount: 10,
      status: EventStatus.DRAFT,
      createdById: 'user-123',
    };

    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue(existingEvent);
    });

    it('should update event successfully', async () => {
      const updateDto: UpdateEventDto = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const updatedEvent = { ...existingEvent, ...updateDto };
      mockRepository.save.mockResolvedValue(updatedEvent);

      const result = await service.update('event-123', updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
      expect(result.description).toBe('Updated Description');
    });

    it('should throw BadRequestException if capacity is less than reservedCount', async () => {
      const updateDto: UpdateEventDto = {
        capacity: 5, // Less than reservedCount (10)
      };

      await expect(service.update('event-123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('event-123', updateDto)).rejects.toThrow(
        'Capacity cannot be less than current reservations (10)',
      );
    });

    it('should throw BadRequestException if trying to publish event in the past', async () => {
      const pastEvent = {
        ...existingEvent,
        startDate: new Date(Date.now() - 86400000), // Yesterday
      };
      mockRepository.findOne.mockResolvedValue(pastEvent);

      const updateDto: UpdateEventDto = {
        status: EventStatus.PUBLISHED,
      };

      await expect(service.update('event-123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('event-123', updateDto)).rejects.toThrow(
        'Cannot publish event that has already started',
      );
    });

    it('should update dates with validation', async () => {
      const updateDto: UpdateEventDto = {
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
      };

      const updatedEvent = {
        ...existingEvent,
        startDate: new Date(updateDto.startDate),
        endDate: new Date(updateDto.endDate),
      };
      mockRepository.save.mockResolvedValue(updatedEvent);

      const result = await service.update('event-123', updateDto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.startDate).toEqual(new Date(updateDto.startDate));
      expect(result.endDate).toEqual(new Date(updateDto.endDate));
    });

    it('should throw BadRequestException if updated end date is before start date', async () => {
      const updateDto: UpdateEventDto = {
        endDate: new Date(Date.now() + 43200000).toISOString(), // Before current start date
      };

      await expect(service.update('event-123', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('event-123', updateDto)).rejects.toThrow(
        'End date must be after start date',
      );
    });
  });

  describe('publish', () => {
    const draftEvent = {
      id: 'event-123',
      title: 'Test Event',
      status: EventStatus.DRAFT,
      startDate: new Date(Date.now() + 86400000), // Tomorrow
      createdBy: { id: 'user-1', email: 'user1@example.com' },
    };

    it('should publish a draft event successfully', async () => {
      mockRepository.findOne.mockResolvedValue(draftEvent);
      const publishedEvent = { ...draftEvent, status: EventStatus.PUBLISHED };
      mockRepository.save.mockResolvedValue(publishedEvent);

      const result = await service.publish('event-123');

      expect(repository.save).toHaveBeenCalled();
      expect(result.status).toBe(EventStatus.PUBLISHED);
    });

    it('should throw BadRequestException if event is already published', async () => {
      const publishedEvent = { ...draftEvent, status: EventStatus.PUBLISHED };
      mockRepository.findOne.mockResolvedValue(publishedEvent);

      await expect(service.publish('event-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.publish('event-123')).rejects.toThrow(
        'Event is already published',
      );
    });

    it('should throw BadRequestException if event is canceled', async () => {
      const canceledEvent = { ...draftEvent, status: EventStatus.CANCELED };
      mockRepository.findOne.mockResolvedValue(canceledEvent);

      await expect(service.publish('event-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.publish('event-123')).rejects.toThrow(
        'Cannot publish a canceled event',
      );
    });

    it('should throw BadRequestException if event has already started', async () => {
      const pastEvent = {
        ...draftEvent,
        status: EventStatus.DRAFT, // Ensure it's Draft, not Published
        startDate: new Date(Date.now() - 86400000), // Yesterday
      };
      mockRepository.findOne.mockResolvedValue(pastEvent);

      await expect(service.publish('event-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.publish('event-123')).rejects.toThrow(
        'Cannot publish event that has already started',
      );
    });
  });

  describe('cancel', () => {
    const activeEvent = {
      id: 'event-123',
      title: 'Test Event',
      status: EventStatus.PUBLISHED,
      startDate: new Date(Date.now() + 86400000),
      createdBy: { id: 'user-1', email: 'user1@example.com' },
    };

    it('should cancel a published event successfully', async () => {
      mockRepository.findOne.mockResolvedValue(activeEvent);
      const canceledEvent = { ...activeEvent, status: EventStatus.CANCELED };
      mockRepository.save.mockResolvedValue(canceledEvent);

      const result = await service.cancel('event-123');

      expect(repository.save).toHaveBeenCalled();
      expect(result.status).toBe(EventStatus.CANCELED);
    });

    it('should cancel a draft event successfully', async () => {
      const draftEvent = { ...activeEvent, status: EventStatus.DRAFT };
      mockRepository.findOne.mockResolvedValue(draftEvent);
      const canceledEvent = { ...draftEvent, status: EventStatus.CANCELED };
      mockRepository.save.mockResolvedValue(canceledEvent);

      const result = await service.cancel('event-123');

      expect(repository.save).toHaveBeenCalled();
      expect(result.status).toBe(EventStatus.CANCELED);
    });

    it('should throw BadRequestException if event is already canceled', async () => {
      const canceledEvent = { ...activeEvent, status: EventStatus.CANCELED };
      mockRepository.findOne.mockResolvedValue(canceledEvent);

      await expect(service.cancel('event-123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancel('event-123')).rejects.toThrow(
        'Event is already canceled',
      );
    });
  });
});
