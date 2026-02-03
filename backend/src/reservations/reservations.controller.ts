import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Get,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto';
import { RolesGuard } from '../auth/guards';
import { Roles, GetUser } from '../auth/decorators';
import { UserRole } from '../users/enums/user-role.enum';
import { PdfService } from '../pdf/pdf.service';
import { ReservationStatus } from './enums/reservation-status.enum';

@Controller('reservations')
@UseGuards(RolesGuard)
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  @Roles(UserRole.PARTICIPANT)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @GetUser() user: any,
  ) {
    return this.reservationsService.create(createReservationDto, user.sub);
  }

  @Post(':id/confirm')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async confirm(@Param('id') id: string) {
    return this.reservationsService.confirm(id);
  }

  @Post(':id/refuse')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async refuse(@Param('id') id: string) {
    return this.reservationsService.refuse(id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.PARTICIPANT)
  @HttpCode(HttpStatus.OK)
  async cancel(@Param('id') id: string, @GetUser() user: any) {
    return this.reservationsService.cancel(id, user.sub);
  }

  @Get(':id/ticket')
  @Roles(UserRole.PARTICIPANT)
  async downloadTicket(
    @Param('id') id: string,
    @GetUser() user: any,
    @Res() res: Response,
  ) {
    // Find reservation with relations
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new BadRequestException('Reservation not found');
    }

    // Verify ownership
    if (reservation.participant.id !== user.sub) {
      throw new BadRequestException(
        'You can only download tickets for your own reservations',
      );
    }

    // Only allow ticket download for confirmed reservations
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        'Tickets can only be downloaded for confirmed reservations',
      );
    }

    // Generate PDF
    const pdfBuffer = await this.pdfService.generateTicket(reservation);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ticket-${reservation.id}.pdf`,
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  }
}
