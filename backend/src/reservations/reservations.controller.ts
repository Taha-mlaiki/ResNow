import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto';
import { RolesGuard } from '../auth/guards';
import { Roles, GetUser } from '../auth/decorators';
import { UserRole } from '../users/enums/user-role.enum';

@Controller('reservations')
@UseGuards(RolesGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @Roles(UserRole.PARTICIPANT)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @GetUser() user: any,
  ) {
    return this.reservationsService.create(createReservationDto, user.sub);
  }
}
