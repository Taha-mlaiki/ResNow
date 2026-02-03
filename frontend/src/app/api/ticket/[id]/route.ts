import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const res = await fetch(`${API_URL}/reservations/${id}/ticket`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            return new NextResponse(res.statusText, { status: res.status });
        }

        const blob = await res.blob();
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="ticket-${id}.pdf"`);

        return new NextResponse(blob, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Download ticket error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
