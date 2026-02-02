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
}
