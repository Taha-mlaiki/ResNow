import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto';
import { RolesGuard } from '../auth/guards';
import { Roles, GetUser, Public } from '../auth/decorators';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('events')
@UseGuards(RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEventDto: CreateEventDto, @GetUser() user: any) {
    return this.eventsService.create(createEventDto, user.sub);
  }

  @Get('public')
  @Public()
  async findPublished() {
    return this.eventsService.findPublished();
  }

  @Get('public/:id')
  @Public()
  async findPublishedOne(@Param('id') id: string) {
    return this.eventsService.findPublishedOne(id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PARTICIPANT)
  async findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PARTICIPANT)
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Post(':id/publish')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id') id: string) {
    return this.eventsService.publish(id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string) {
    return this.eventsService.cancel(id);
  }
}
