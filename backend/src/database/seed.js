require('dotenv/config');
const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function seed() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '123456789',
        database: process.env.DB_DATABASE || 'reserv_now',
    });

    try {
        await client.connect();
        console.log('Connected to database...');

        // Clear existing data
        await client.query('DELETE FROM reservations');
        await client.query('DELETE FROM events');
        await client.query('DELETE FROM users');
        console.log('Cleared existing data');

        // Create Admin User
        const adminPassword = await bcrypt.hash('admin123', 10);
        const adminResult = await client.query(
            `INSERT INTO users (email, password, "firstName", "lastName", role) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            ['admin@reservnow.com', adminPassword, 'Admin', 'User', 'Admin']
        );
        const adminId = adminResult.rows[0].id;
        console.log('Created admin: admin@reservnow.com / admin123');

        // Create Participant
        const userPassword = await bcrypt.hash('user123', 10);
        const userResult = await client.query(
            `INSERT INTO users (email, password, "firstName", "lastName", role) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            ['john@example.com', userPassword, 'John', 'Doe', 'Participant']
        );
        const userId = userResult.rows[0].id;
        console.log('Created user: john@example.com / user123');

        // Create Events (with createdById)
        const now = new Date();
        const event1Result = await client.query(
            `INSERT INTO events (title, description, "startDate", "endDate", location, capacity, "reservedCount", status, "createdById") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [
                'Tech Conference 2026',
                'Annual technology conference featuring AI and cloud computing.',
                new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
                new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
                'Convention Center, Hall A',
                200, 0, 'Published', adminId
            ]
        );
        const event1Id = event1Result.rows[0].id;

        await client.query(
            `INSERT INTO events (title, description, "startDate", "endDate", location, capacity, "reservedCount", status, "createdById") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                'Music Festival',
                'A weekend of amazing live performances.',
                new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
                new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000),
                'Central Park',
                5000, 0, 'Published', adminId
            ]
        );

        await client.query(
            `INSERT INTO events (title, description, "startDate", "endDate", location, capacity, "reservedCount", status, "createdById") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                'Business Workshop',
                'Intensive workshop on entrepreneurship.',
                new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
                new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
                'Business Hub, Room 101',
                30, 0, 'Published', adminId
            ]
        );
        console.log('Created 3 published events');

        // Create Reservation
        await client.query(
            `INSERT INTO reservations ("participantId", "eventId", status) VALUES ($1, $2, $3)`,
            [userId, event1Id, 'Confirmed']
        );
        await client.query(`UPDATE events SET "reservedCount" = 1 WHERE id = $1`, [event1Id]);
        console.log('Created 1 confirmed reservation');

        console.log('\n✅ Seeding complete!');
        console.log('\n📋 Test Credentials:');
        console.log('   Admin: admin@reservnow.com / admin123');
        console.log('   User:  john@example.com / user123');

    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

seed();
