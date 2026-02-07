import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities';
import { CreateEventDto, UpdateEventDto } from './dto';
import { EventStatus } from './enums/event-status.enum';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  /**
   * Create a new event
   * @param createEventDto - Event creation data
   * @param createdById - ID of the user creating the event
   * @returns Created event
   */
  async create(
    createEventDto: CreateEventDto,
    createdById: string,
  ): Promise<Event> {
    // Validate dates
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Create event with Draft status by default
    const event = this.eventRepository.create({
      ...createEventDto,
      startDate,
      endDate,
      createdById,
      status: EventStatus.DRAFT,
      reservedCount: 0,
    });

    return this.eventRepository.save(event);
  }

  /**
   * Find all events
   * @returns Array of events
   */
  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['createdBy'],
      order: { startDate: 'ASC' },
    });
  }

  /**
   * Find all published events (public access)
   * @returns Array of published events
   */
  async findPublished(): Promise<Event[]> {
    return this.eventRepository.find({
      where: { status: EventStatus.PUBLISHED },
      relations: ['createdBy'],
      order: { startDate: 'ASC' },
    });
  }

  /**
   * Find a single published event
   * @param id - Event ID
   * @returns Published event
   */
  async findPublishedOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id, status: EventStatus.PUBLISHED },
      relations: ['createdBy'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Find event by ID
   * @param id - Event ID
   * @returns Event
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  /**
   * Update an event
   * @param id - Event ID
   * @param updateEventDto - Event update data
   * @returns Updated event
   */
  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    // Validate dates if provided
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const startDate = updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : event.startDate;
      const endDate = updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : event.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }

      if (startDate < new Date() && updateEventDto.startDate) {
        throw new BadRequestException('Start date cannot be in the past');
      }

      if (updateEventDto.startDate) {
        event.startDate = startDate;
      }
      if (updateEventDto.endDate) {
        event.endDate = endDate;
      }
    }

    // Validate capacity if provided
    if (updateEventDto.capacity !== undefined) {
      if (updateEventDto.capacity < event.reservedCount) {
        throw new BadRequestException(
          `Capacity cannot be less than current reservations (${event.reservedCount})`,
        );
      }
      event.capacity = updateEventDto.capacity;
    }

    // Validate status transitions
    if (updateEventDto.status) {
      // Cannot publish event in the past
      if (
        updateEventDto.status === EventStatus.PUBLISHED &&
        event.startDate < new Date()
      ) {
        throw new BadRequestException(
          'Cannot publish event that has already started',
        );
      }
      event.status = updateEventDto.status;
    }

    // Update other fields
    if (updateEventDto.title) event.title = updateEventDto.title;
    if (updateEventDto.description)
      event.description = updateEventDto.description;
    if (updateEventDto.location) event.location = updateEventDto.location;

    return this.eventRepository.save(event);
  }

  /**
   * Publish an event
   * @param id - Event ID
   * @returns Published event
   */
  async publish(id: string): Promise<Event> {
    const event = await this.findOne(id);

    // Validate event can be published
    if (event.status === EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is already published');
    }

    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException('Cannot publish a canceled event');
    }

    if (event.startDate < new Date()) {
      throw new BadRequestException(
        'Cannot publish event that has already started',
      );
    }

    event.status = EventStatus.PUBLISHED;
    return this.eventRepository.save(event);
  }

  /**
   * Cancel an event
   * @param id - Event ID
   * @returns Canceled event
   */
  async cancel(id: string): Promise<Event> {
    const event = await this.findOne(id);

    // Validate event can be canceled
    if (event.status === EventStatus.CANCELED) {
      throw new BadRequestException('Event is already canceled');
    }

    event.status = EventStatus.CANCELED;
    return this.eventRepository.save(event);
  }
}
