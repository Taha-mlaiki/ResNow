import { getEventAdmin } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { EditEventForm } from './form';

export default async function EditEventPage({
    params,
}: {
    params: { id: string };
}) {
    // Await params for Next.js 15+
    const { id } = await params;
    const token = await getSession();

    if (!token) {
        redirect('/login');
    }

    let event;
    try {
        event = await getEventAdmin(id, token);
    } catch (e) {
        notFound();
    }

    return (
        <main className="min-h-screen py-16 flex justify-center">
            <div className="w-full max-w-4xl px-6">
                <div className="p-10 rounded-lg bg-card border shadow-sm">
                    <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
                    <p className="text-muted-foreground mb-8">Update event details.</p>
                    <EditEventForm event={event} />
                </div>
            </div>
        </main>
    );
}
