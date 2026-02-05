import { getSession } from '@/lib/auth';
import { getAllReservations } from '@/lib/api';
import { redirect } from 'next/navigation';
import { ReservationsClient } from './client';

export const dynamic = 'force-dynamic';

export default async function AdminReservationsPage() {
    const token = await getSession();

    if (!token) {
        redirect('/login');
    }

    // Role check ideally happens here too, but middleware/api protects data

    let reservations = [];
    try {
        reservations = await getAllReservations(token);
    } catch (error) {
        console.error('Failed to fetch reservations', error);
    }

    return (
        <main className="min-h-screen bg-background">
            <ReservationsClient reservations={reservations} />
        </main>
    );
}
