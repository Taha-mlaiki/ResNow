import { getEvent } from '@/lib/api';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { EventDetails } from '@/components/EventDetails';
import styles from './page.module.css';

// Revalidate every 60 seconds
// export const revalidate = 60;
export const dynamic = 'force-dynamic';

export default async function EventDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    let event;
    let token;
    try {
        event = await getEvent(params.id);
        token = await getSession();
    } catch (error) {
        notFound();
    }

    return (
        <main className={styles.main}>
            <EventDetails event={event} isLoggedIn={!!token} />
        </main>
    );
}
