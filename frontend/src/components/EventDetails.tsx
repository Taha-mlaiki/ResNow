import Link from 'next/link';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Event } from '@/types/event';
import styles from '@/app/events/[id]/page.module.css';
import { BookButton } from './BookButton';

interface EventDetailsProps {
    event: Event;
    isLoggedIn: boolean;
}

export function EventDetails({ event, isLoggedIn }: EventDetailsProps) {
    const startDate = new Date(event.startDate).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const startTime = new Date(event.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const endTime = new Date(event.endDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const spotsLeft = event.capacity - event.reservedCount;
    const isFull = spotsLeft <= 0;

    return (
        <div className="container">
            <Link href="/events" className={styles.backLink}>
                <ArrowLeft size={20} />
                Back to Events
            </Link>

            <div className={`${styles.card} glass`}>
                <div className={styles.header}>
                    <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        {event.title}
                    </h1>
                    <div className={styles.metaRow}>
                        <div className={styles.metaItem}>
                            <Calendar size={20} className={styles.icon} />
                            <span>{startDate} • {startTime} - {endTime}</span>
                        </div>
                        <div className={styles.metaItem}>
                            <MapPin size={20} className={styles.icon} />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    <h2 className={styles.sectionTitle}>About this Event</h2>
                    <p className={styles.description}>{event.description}</p>

                    <h2 className={styles.sectionTitle}>Availability</h2>
                    <div className={styles.metaItem} style={{ marginBottom: '2rem' }}>
                        <Users size={20} className={styles.icon} />
                        <span>
                            {isFull ? 'Sold Out' : `${spotsLeft} spots remaining`} (Capacity: {event.capacity})
                        </span>
                    </div>

                    <div className={styles.actions}>
                        <BookButton
                            eventId={event.id}
                            isLoggedIn={isLoggedIn}
                            isFull={isFull}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
