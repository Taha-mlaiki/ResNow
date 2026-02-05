import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminDashboardClient } from './dashboard-client';
import { getAllEvents, getAllReservations } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const token = await getSession();

    if (!token) {
        redirect('/login');
    }

    let initialEvents = [];
    let initialReservations = [];

    try {
        const [eventsData, reservationsData] = await Promise.all([
            getAllEvents(token),
            getAllReservations(token),
        ]);
        initialEvents = eventsData;
        initialReservations = reservationsData;
    } catch (e) {
        console.error('Failed to fetch initial admin data', e);
        // We can choose to redirect or show empty
    }

    return (
        <AdminDashboardClient
            token={token}
            initialEvents={initialEvents}
            initialReservations={initialReservations}
        />
    );
}
