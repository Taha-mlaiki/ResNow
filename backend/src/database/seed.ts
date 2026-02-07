import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Event } from '../events/entities/event.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { EventStatus } from '../events/enums/event-status.enum';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';

async function seed() {
  console.log('Starting seed...');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_DATABASE:', process.env.DB_DATABASE);

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '123456789',
    database: process.env.DB_DATABASE || 'reserv_now',
    entities: [User, Event, Reservation],
    synchronize: true,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected for seeding...');

    const userRepo = dataSource.getRepository(User);
    const eventRepo = dataSource.getRepository(Event);
    const reservationRepo = dataSource.getRepository(Reservation);

    // Clear existing data
    console.log('Clearing existing data...');
    await reservationRepo.delete({});
    await eventRepo.delete({});
    await userRepo.delete({});
    console.log('Cleared existing data');

    // Create Admin User
    console.log('Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepo.create({
      email: 'admin@reservnow.com',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });
    await userRepo.save(admin);
    console.log('Created admin user: admin@reservnow.com / admin123');

    // Create Participant User
    console.log('Creating participant user...');
    const hashedUserPassword = await bcrypt.hash('user123', 10);
    const participant = userRepo.create({
      email: 'john@example.com',
      password: hashedUserPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.PARTICIPANT,
    });
    await userRepo.save(participant);
    console.log('Created participant: john@example.com / user123');

    // Create Events
    console.log('Creating events...');
    const now = new Date();

    const event1 = eventRepo.create({
      title: 'Tech Conference 2026',
      description:
        'Annual technology conference featuring AI and cloud computing.',
      startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(
        now.getTime() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
      ),
      location: 'Convention Center, Hall A',
      capacity: 200,
      reservedCount: 0,
      status: EventStatus.PUBLISHED,
    });
    await eventRepo.save(event1);

    const event2 = eventRepo.create({
      title: 'Music Festival',
      description: 'A weekend of amazing live performances.',
      startDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
      location: 'Central Park',
      capacity: 5000,
      reservedCount: 0,
      status: EventStatus.PUBLISHED,
    });
    await eventRepo.save(event2);

    const event3 = eventRepo.create({
      title: 'Business Workshop',
      description: 'Intensive workshop on entrepreneurship.',
      startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(
        now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000,
      ),
      location: 'Business Hub, Room 101',
      capacity: 30,
      reservedCount: 0,
      status: EventStatus.PUBLISHED,
    });
    await eventRepo.save(event3);
    console.log('Created 3 published events');

    // Create Reservation
    console.log('Creating reservation...');
    const reservation = reservationRepo.create({
      participant: participant,
      event: event1,
      status: ReservationStatus.CONFIRMED,
    });
    await reservationRepo.save(reservation);
    await eventRepo.update(event1.id, { reservedCount: 1 });
    console.log('Created 1 reservation');

    await dataSource.destroy();
    console.log('\n✅ Seeding complete!');
    console.log('\n📋 Test Credentials:');
    console.log('   Admin: admin@reservnow.com / admin123');
    console.log('   User:  john@example.com / user123');
  } catch (error) {
    console.error('Seeding failed:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
