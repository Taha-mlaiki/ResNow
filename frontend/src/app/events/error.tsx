'use client';

import { useEffect } from 'react';
import styles from './page.module.css';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className={styles.main}>
            <div className="container">
                <div className={`${styles.empty} glass`} style={{ border: '1px solid hsl(var(--destructive) / 0.3)' }}>
                    <h2 style={{ color: 'hsl(var(--destructive))' }}>Something went wrong!</h2>
                    <p style={{ marginBottom: '2rem' }}>We couldn&apos;t load the events. Please try again later.</p>
                    <button
                        onClick={() => reset()}
                        className="btn btn-primary"
                    >
                        Try again
                    </button>
                </div>
            </div>
        </main>
    );
}
