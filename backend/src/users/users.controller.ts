import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators';
import { RolesGuard } from '../auth/guards';
import { UserRole } from './enums/user-role.enum';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  @Get('admin/dashboard')
  @Roles(UserRole.ADMIN)
  getAdminDashboard() {
    return {
      message: 'Admin dashboard - only accessible by admins',
      data: {
        totalUsers: 100,
        totalEvents: 50,
        totalReservations: 200,
      },
    };
  }

  @Get('participant/profile')
  @Roles(UserRole.PARTICIPANT)
  getParticipantProfile() {
    return {
      message: 'Participant profile - only accessible by participants',
      data: {
        reservations: [],
        upcomingEvents: [],
      },
    };
  }

  @Get('profile')
  @Roles(UserRole.ADMIN, UserRole.PARTICIPANT)
  getProfile() {
    return {
      message: 'User profile - accessible by both admins and participants',
    };
  }
}
