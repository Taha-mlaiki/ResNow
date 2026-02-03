'use client';

import { Reservation } from '@/types/reservation';
import { confirmReservationAction, refuseReservationAction } from '@/lib/actions';
import { useTransition } from 'react';
import styles from './AdminReservationList.module.css';
import { Calendar, Clock, MapPin, User, Check, X } from 'lucide-react';

interface AdminReservationListProps {
    reservations: Reservation[];
}

export function AdminReservationList({ reservations }: AdminReservationListProps) {
    const [isPending, startTransition] = useTransition();

    const handleConfirm = (id: string) => {
        startTransition(async () => {
            await confirmReservationAction(id);
        });
    };

    const handleRefuse = (id: string) => {
        if (!confirm('Are you sure you want to refuse this reservation?')) return;
        startTransition(async () => {
            await refuseReservationAction(id);
        });
    };

    return (
        <div className={styles.list}>
            {reservations.map((reservation) => (
                <div key={reservation.id} className={`${styles.card} glass`}>
                    <div className={styles.header}>
                        <div className={styles.userInfo}>
                            <User size={18} className={styles.icon} />
                            <span className={styles.userName}>
                                {reservation.participant.firstName} {reservation.participant.lastName}
                            </span>
                            <span className={styles.userEmail}>({reservation.participant.email})</span>
                        </div>
                        <span className={`${styles.status} ${styles[reservation.status.toLowerCase()]}`}>
                            {reservation.status}
                        </span>
                    </div>

                    <div className={styles.eventInfo}>
                        <h3>{reservation.event.title}</h3>
                        <div className={styles.meta}>
                            <span><Calendar size={14} /> {new Date(reservation.event.startDate).toLocaleDateString()}</span>
                            <span><MapPin size={14} /> {reservation.event.location}</span>
                        </div>
                    </div>

                    {reservation.status === 'Pending' && (
                        <div className={styles.actions}>
                            <button
                                onClick={() => handleConfirm(reservation.id)}
                                disabled={isPending}
                                className="btn"
                                style={{ backgroundColor: 'hsl(var(--success))', color: 'white', border: 'none', padding: '0.4rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                            >
                                <Check size={16} /> Confirm
                            </button>
                            <button
                                onClick={() => handleRefuse(reservation.id)}
                                disabled={isPending}
                                className="btn"
                                style={{ backgroundColor: 'transparent', border: '1px solid hsl(var(--destructive))', color: 'hsl(var(--destructive))', padding: '0.4rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                            >
                                <X size={16} /> Refuse
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
