'use client';

import { useTransition } from 'react';
import { bookEvent } from '@/lib/actions';
import { useRouter } from 'next/navigation';

interface BookButtonProps {
    eventId: string;
    isLoggedIn: boolean;
    isFull: boolean;
}

export function BookButton({ eventId, isLoggedIn, isFull }: BookButtonProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleBook = () => {
        if (!isLoggedIn) {
            router.push(`/login?callbackUrl=/events/${eventId}`); // Simple redirect
            return;
        }

        startTransition(async () => {
            const result = await bookEvent(eventId);
            if (result && result.error) {
                alert(result.error);
            }
            // If success, bookEvent redirects to dashboard
        });
    };

    if (isFull) {
        return (
            <button className="btn btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed', padding: '1rem 3rem', fontSize: '1.2rem' }}>
                Sold Out
            </button>
        );
    }

    return (
        <button
            onClick={handleBook}
            disabled={isPending}
            className="btn btn-primary"
            style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}
        >
            {isPending ? 'Booking...' : (isLoggedIn ? 'Book Now' : 'Sign in to Book')}
        </button>
    );
}
