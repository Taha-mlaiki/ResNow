import { getSession } from '@/lib/auth';
import { getAllReservations } from '@/lib/api';
import { AdminReservationList } from '@/components/AdminReservationList';
import { redirect } from 'next/navigation';
import styles from '@/app/dashboard/page.module.css';

// Admin dashboard revalidates frequently or on action
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const token = await getSession();

    if (!token) {
        redirect('/login');
        // Ideally check role here, but we'll let API fail if not admin
        // Or add logic to decode token if possible
    }

    let reservations = [];
    try {
        reservations = await getAllReservations(token);
    } catch (err) {
        // If forbidden, maybe redirect?
        console.error('Admin Fetch Error:', err);
        // return <div>Access Denied</div>; // Or styled error
    }

    return (
        <main className={styles.main}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>Admin Dashboard</h1>
                    <p className={styles.subtitle}>Moderate reservations and manage events</p>
                </header>

                <section>
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Reservations</h2>
                    {reservations.length > 0 ? (
                        <AdminReservationList reservations={reservations} />
                    ) : (
                        <p>No reservations found or access denied.</p>
                    )}
                </section>
            </div>
        </main>
    );
}
