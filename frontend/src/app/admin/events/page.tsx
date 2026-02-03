import { getSession } from '@/lib/auth';
import { getAllEvents } from '@/lib/api';
import Link from 'next/link';
import { Calendar, MapPin } from 'lucide-react';
import styles from '@/app/dashboard/page.module.css';
import { EventListActions } from '@/components/EventListActions';

export const dynamic = 'force-dynamic';

export default async function AdminEventsPage() {
    const token = await getSession();
    if (!token) return <div>Unauthorized</div>;

    let events = [];
    try {
        events = await getAllEvents(token);
    } catch (e) {
        console.error(e);
    }

    return (
        <main className={styles.main}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>Manage Events</h1>
                    <Link href="/admin/events/new" className="btn btn-primary">
                        + Create Event
                    </Link>
                </header>

                <div className={styles.list}>
                    {events.map((event: any) => (
                        <div key={event.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{event.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    <span><Calendar size={14} /> {new Date(event.startDate).toLocaleDateString()}</span>
                                    <span><MapPin size={14} /> {event.location}</span>
                                    <span>Status: <b style={{ color: event.status === 'Published' ? 'var(--success)' : 'var(--muted-foreground)' }}>{event.status}</b></span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <EventListActions eventId={event.id} status={event.status} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
