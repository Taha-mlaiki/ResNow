import { getPublishedEvents } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { EventGrid } from '@/components/EventGrid';
import { Event } from '@/types/event';
import Link from 'next/link';
import styles from './page.module.css';

// Revalidate every 60 seconds (ISR) or force dynamic if preferred
// export const revalidate = 60; 
export const dynamic = 'force-dynamic'; // For real-time updates during dev

export default async function EventsPage() {
    let events: Event[] = [];
    try {
        events = await getPublishedEvents();
    } catch (error) {
        console.error('Failed to fetch events', error);
    }

    return (
        <main className={styles.main}>
            <div className="container">
                <header className={styles.header}>
                    <div className={styles.breadcrumb}>
                        <Link href="/" className={styles.link}>Home</Link>
                        <span className={styles.separator}>/</span>
                        <span>Events</span>
                    </div>
                    <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: 800 }}>
                        Upcoming Events
                    </h1>
                    <p className={styles.subtitle}>
                        Explore our curated selection of exclusive experiences.
                    </p>
                </header>

                {events.length > 0 ? (
                    <EventGrid>
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </EventGrid>
                ) : (
                    <div className={`${styles.empty} glass`}>
                        <h2>No events found</h2>
                        <p>Check back later for new upcoming events.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
