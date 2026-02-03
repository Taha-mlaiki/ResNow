'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/lib/auth';
import Link from 'next/link';
import styles from './page.module.css';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button className="btn btn-primary" disabled={pending} style={{ width: '100%' }}>
            {pending ? 'Signing in...' : 'Sign In'}
        </button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useFormState(login, null);

    return (
        <main className={styles.main}>
            <div className={`${styles.card} glass`}>
                <h1 className={styles.title}>Welcome Back</h1>
                <p className={styles.subtitle}>Sign in to manage your reservations</p>

                <form action={formAction} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="you@example.com" />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" required placeholder="••••••••" />
                    </div>

                    {state?.error && <p className={styles.error}>{state.error}</p>}

                    <SubmitButton />
                </form>

                <p className={styles.footer}>
                    Don&apos;t have an account? <Link href="/register">Sign Up</Link>
                </p>
            </div>
        </main>
    );
}
