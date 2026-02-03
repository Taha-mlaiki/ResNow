import { ReservationStatus } from '@/types/enums';
import { Reservation } from '@/types/reservation';
import { Calendar, MapPin, Ticket, Clock, AlertCircle } from 'lucide-react';
import styles from './ReservationCard.module.css';

interface ReservationCardProps {
    reservation: Reservation;
    onCancel?: (id: string) => void;
    onDownload?: (id: string) => void;
}

export function ReservationCard({ reservation, onCancel, onDownload }: ReservationCardProps) {
    const event = reservation.event;
    const startDate = new Date(event.startDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const startTime = new Date(event.startDate).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const statusColors = {
        [ReservationStatus.PENDING]: 'var(--warning)',
        [ReservationStatus.CONFIRMED]: 'var(--success)',
        [ReservationStatus.REFUSED]: 'var(--destructive)',
        [ReservationStatus.CANCELED]: 'var(--muted-foreground)',
    };

    const statusColor = statusColors[reservation.status] || 'gray';

    return (
        <div className={`${styles.card} glass`}>
            <div className={styles.header}>
                <h3 className={styles.title}>{event.title}</h3>
                <span className={styles.status} style={{ backgroundColor: `hsl(${statusColor} / 0.1)`, color: `hsl(${statusColor})`, border: `1px solid hsl(${statusColor} / 0.2)` }}>
                    {reservation.status}
                </span>
            </div>

            <div className={styles.meta}>
                <div className={styles.metaItem}>
                    <Calendar size={16} className={styles.icon} />
                    <span>{startDate} at {startTime}</span>
                </div>
                <div className={styles.metaItem}>
                    <MapPin size={16} className={styles.icon} />
                    <span>{event.location}</span>
                </div>
                <div className={styles.metaItem}>
                    <Clock size={16} className={styles.icon} />
                    <span>Reserved {new Date(reservation.createdAt).toLocaleDateString()}</span>
                </div>
            </div>

            <div className={styles.actions}>
                {reservation.status === ReservationStatus.CONFIRMED && onDownload && (
                    <button onClick={() => onDownload(reservation.id)} className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                        <Ticket size={16} style={{ marginRight: '0.5rem' }} />
                        Download Ticket
                    </button>
                )}

                {(reservation.status === ReservationStatus.PENDING || reservation.status === ReservationStatus.CONFIRMED) && onCancel && (
                    <button onClick={() => onCancel(reservation.id)} className="btn" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', border: '1px solid hsl(var(--destructive))', color: 'hsl(var(--destructive))', background: 'transparent' }}>
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}
