'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { register } from '@/lib/auth';
import Link from 'next/link';
import styles from './page.module.css';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button className="btn btn-primary" disabled={pending} style={{ width: '100%' }}>
            {pending ? 'Creating Account...' : 'Sign Up'}
        </button>
    );
}

export default function RegisterPage({
    searchParams,
}: {
    searchParams: { registered?: string };
}) {
    const [state, formAction] = useFormState(register, null);

    // If redirected from successful registration (handled in auth.ts via redirect to login? No, auth.ts redirects to login? 
    // Wait, auth.ts redirects to /login?registered=true. This page is /register. 
    // Ah, if I want to show success message ON LOGIN page, I should handle searchParams there.
    // But here is Register page.

    return (
        <main className={styles.main}>
            <div className={`${styles.card} glass`}>
                <h1 className={styles.title}>Create Account</h1>
                <p className={styles.subtitle}>Join us to book exclusive events</p>

                <form action={formAction} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Full Name</label>
                        <input type="text" id="name" name="name" required placeholder="John Doe" />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" required placeholder="you@example.com" />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" required placeholder="••••••••" minLength={6} />
                    </div>

                    {state?.error && <p className={styles.error}>{state.error}</p>}

                    <SubmitButton />
                </form>

                <p className={styles.footer}>
                    Already have an account? <Link href="/login">Sign In</Link>
                </p>
            </div>
        </main>
    );
}
