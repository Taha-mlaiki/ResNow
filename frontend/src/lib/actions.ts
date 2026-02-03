'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function cancelReservation(reservationId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return { error: 'Not authenticated' };
    }

    try {
        const res = await fetch(`${API_URL}/reservations/${reservationId}/cancel`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            const data = await res.json();
            return { error: data.message || 'Failed to cancel reservation' };
        }

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to cancel reservation' };
    }
}

export async function bookEvent(eventId: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        redirect(`/login?callbackUrl=/events/${eventId}`);
    }

    try {
        const res = await fetch(`${API_URL}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ eventId }),
        });

        if (!res.ok) {
            const data = await res.json();
            return { error: data.message || 'Failed to book event' };
        }
    } catch (error) {
        console.error('Book event error:', error);
        return { error: 'Failed to book event' };
    }

    revalidatePath('/dashboard');
    revalidatePath(`/events/${eventId}`);
    redirect('/dashboard');
}

export async function downloadTicket(reservationId: string) {
    // Placeholder, actual logic in app/api/ticket/[id]/route.ts
    // This function is kept for signature compatibility if needed
    return null;
}

// --- Admin Actions ---

export async function confirmReservationAction(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return { error: 'Unauthorized' };

    try {
        const res = await fetch(`${API_URL}/reservations/${id}/confirm`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return { error: 'Failed to confirm' };

        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to confirm' };
    }
}

export async function refuseReservationAction(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return { error: 'Unauthorized' };

    try {
        const res = await fetch(`${API_URL}/reservations/${id}/refuse`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return { error: 'Failed to refuse' };

        revalidatePath('/admin');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to refuse' };
    }
}

export async function createEventAction(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
        redirect('/login');
    }

    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        location: formData.get('location'),
        capacity: Number(formData.get('capacity')),
    };

    const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        // For now just throw - in production use proper error handling
        throw new Error('Failed to create event');
    }

    revalidatePath('/admin/events');
    revalidatePath('/events');
    redirect('/admin/events');
}


export async function publishEventAction(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return { error: 'Unauthorized' };

    try {
        const res = await fetch(`${API_URL}/events/${id}/publish`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return { error: 'Failed to publish' };

        revalidatePath('/admin/events');
        revalidatePath('/events');
        return { success: true };
    } catch (e) {
        return { error: 'Failed to publish' };
    }
}
