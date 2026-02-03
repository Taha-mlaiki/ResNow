'use client';

import { Reservation } from '@/types/reservation';
import { ReservationCard } from './ReservationCard';
import { cancelReservation } from '@/lib/actions';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ReservationListProps {
    initialReservations: Reservation[];
    token: string; // Token needed for download? No, use Proxy.
}

export function ReservationList({ initialReservations }: ReservationListProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this reservation?')) return;

        startTransition(async () => {
            const result = await cancelReservation(id);
            if (result.error) {
                alert(result.error);
            } else {
                // Success
                // RevalidatePath handled by server action, but router refresh updates client cache
                // Actually Server Action `revalidatePath` updates the cache on server, 
                // but client component might need to refresh?
                // Next.js handles it if using `useFormState` or similar, or plain action?
                // Usually router.refresh() is good practice.
                // But revalidatePath should work.
            }
        });
    };

    const handleDownload = async (id: string) => {
        // Navigate to proxy route
        window.open(`/api/ticket/${id}`, '_blank');
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
            {initialReservations.map((reservation) => (
                <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onCancel={handleCancel}
                    onDownload={handleDownload}
                />
            ))}
        </div>
    );
}
