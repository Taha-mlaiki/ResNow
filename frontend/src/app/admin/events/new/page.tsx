'use client';

import { createEventAction } from '@/lib/actions';
import { useFormState } from 'react-dom';
import { SubmitButton } from '@/components/SubmitButton'; // Ensure this exists or simple button
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const initialState = {
    error: '',
    success: false,
};

export default function CreateEventPage() {
    // Use useActionState in React 19 / Next 14+? 
    // It's useFormState from react-dom.
    // const [state, formAction] = useFormState(createEventAction, initialState);
    // Warning: Server Action `createEventAction` must match signature (state, formData)
    // My current `createEventAction` signature is (formData).
    // I need to update it or wrap it.
    // If useFormState acts on it, the action receives (prevState, formData).

    // I'll wrap it here or use a client handler calling the action.
    // Using client handler is simpler for redirect logic if needed inside component 
    // (though action handles redirect).

    // Let's use simple form action for now:

    return (
        <main className="container" style={{ padding: '4rem 0' }}>
            <Link href="/admin/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'hsl(var(--muted-foreground))' }}>
                <ArrowLeft size={18} /> Back to Events
            </Link>

            <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem', fontWeight: 700 }}>Create New Event</h1>

                <form action={createEventAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group">
                        <label>Event Title</label>
                        <input name="title" type="text" className="input" required placeholder="e.g. Annual Gala" />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" className="input" required placeholder="Event details..." rows={4} style={{ resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Start Date & Time</label>
                            <input name="startDate" type="datetime-local" className="input" required />
                        </div>
                        <div className="form-group">
                            <label>End Date & Time</label>
                            <input name="endDate" type="datetime-local" className="input" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input name="location" type="text" className="input" required placeholder="e.g. Grand Hall" />
                    </div>

                    <div className="form-group">
                        <label>Capacity</label>
                        <input name="capacity" type="number" className="input" required min="1" placeholder="100" />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create Event</button>
                </form>
            </div>
        </main>
    );
}
