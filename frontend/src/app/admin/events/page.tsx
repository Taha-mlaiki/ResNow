import { getSession } from '@/lib/auth';
import { getAllEvents } from '@/lib/api';
import { redirect } from 'next/navigation';
import { EventsClient } from './client';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
    const token = await getSession();

    if (!token) {
        redirect('/login');
    }

    let events = [];
    try {
        events = await getAllEvents(token);
    } catch (error) {
        console.error('Failed to fetch events', error);
    }

    return (
        <main className="min-h-screen bg-background">
            <EventsClient events={events} />
        </main>
    );
}
