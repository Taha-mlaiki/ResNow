import Link from 'next/link';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { Event } from '@/types/event';
import styles from './EventCard.module.css';

interface EventCardProps {
    event: Event;
}

export function EventCard({ event }: EventCardProps) {
    const startDate = new Date(event.startDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const startTime = new Date(event.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const spotsLeft = event.capacity - event.reservedCount;
    const isFull = spotsLeft <= 0;

    return (
        <div className={`${styles.card} glass`}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{event.title}</h3>
                    <span className={`${styles.badge} ${isFull ? styles.full : styles.available}`}>
                        {isFull ? 'Sold Out' : 'Available'}
                    </span>
                </div>

                <p className={styles.description}>{event.description}</p>

                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <Calendar className={styles.icon} size={16} />
                        <span>{startDate} • {startTime}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <MapPin className={styles.icon} size={16} />
                        <span>{event.location}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Ticket className={styles.icon} size={16} />
                        <span>{spotsLeft} spots left</span>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href={`/events/${event.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
}
