import { Skeleton } from '@/components/Skeleton';
import { EventGrid } from '@/components/EventGrid';
import styles from './page.module.css';

export default function Loading() {
    return (
        <main className={styles.main}>
            <div className="container">
                <header className={styles.header}>
                    <div className={styles.breadcrumb}>
                        <Skeleton width={50} height={20} />
                        <span className={styles.separator}>/</span>
                        <Skeleton width={60} height={20} />
                    </div>
                    <Skeleton width={300} height={60} style={{ marginBottom: '1rem' }} />
                    <Skeleton width={400} height={24} />
                </header>

                <EventGrid>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Skeleton width="60%" height={24} />
                                <Skeleton width={80} height={24} borderRadius={999} />
                            </div>
                            <Skeleton width="100%" height={20} />
                            <Skeleton width="100%" height={20} />

                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <Skeleton width="50%" height={16} />
                                <Skeleton width="40%" height={16} />
                                <Skeleton width="30%" height={16} />
                            </div>
                            <Skeleton width="100%" height={48} borderRadius="var(--radius)" style={{ marginTop: '1rem' }} />
                        </div>
                    ))}
                </EventGrid>
            </div>
        </main>
    );
}
