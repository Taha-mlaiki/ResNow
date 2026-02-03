'use client';

import { publishEventAction } from '@/lib/actions';
import { useTransition } from 'react';
import { Check, Edit, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface EventListActionsProps {
    eventId: string;
    status: string;
}

export function EventListActions({ eventId, status }: EventListActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handlePublish = () => {
        if (!confirm('Are you sure you want to publish this event?')) return;
        startTransition(async () => {
            await publishEventAction(eventId);
        });
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href={`/admin/events/${eventId}/edit`} className="btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
                <Edit size={14} /> Edit
            </Link>

            {status === 'Draft' && (
                <button
                    onClick={handlePublish}
                    disabled={isPending}
                    className="btn"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >
                    {isPending ? <Loader2 size={14} className="spin" /> : <Check size={14} />} Publish
                </button>
            )}
        </div>
    );
}
