import { Event } from '@/types/event';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getPublishedEvents(): Promise<Event[]> {
    const res = await fetch(`${API_URL}/events/public`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        throw new Error('Failed to fetch events');
    }

    return res.json();
}

export async function getEvent(id: string): Promise<Event> {
    const res = await fetch(`${API_URL}/events/public/${id}`, {
        cache: 'no-store',
    });

    if (!res.ok) {
        if (res.status === 404) {
            throw new Error('Event not found');
        }
        throw new Error('Failed to fetch event');
    }

    return res.json();
}

export async function getMyReservations(token: string) {
    const res = await fetch(`${API_URL}/reservations/my`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error('Fetch reservations failed:', res.status, errorText);
        throw new Error(`Failed to fetch reservations: ${res.status}`);
    }

    return res.json();
}

// --- Admin & Protected API ---

export async function getAllReservations(token: string) {
    const res = await fetch(`${API_URL}/reservations`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch reservations');
    return res.json();
}

export async function confirmReservation(id: string, token: string) {
    const res = await fetch(`${API_URL}/reservations/${id}/confirm`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to confirm reservation');
    return res.json();
}

export async function refuseReservation(id: string, token: string) {
    const res = await fetch(`${API_URL}/reservations/${id}/refuse`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to refuse reservation');
    return res.json();
}

export async function getAllEvents(token: string) {
    const res = await fetch(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
}

export async function getEventAdmin(id: string, token: string): Promise<Event> {
    const res = await fetch(`${API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
    });

    if (!res.ok) {
        if (res.status === 404) {
            throw new Error('Event not found');
        }
        throw new Error('Failed to fetch event');
    }

    return res.json();
}
