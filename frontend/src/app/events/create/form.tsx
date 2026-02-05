'use client';

import { createEventAction } from '@/lib/actions';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="min-w-[150px]"
        >
            {pending ? 'Creating...' : 'Create Event'}
        </Button>
    );
}

export function CreateEventForm() {
    return (
        <form action={createEventAction} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="e.g. Summer Music Festival 2026"
                    maxLength={100}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    name="description"
                    required
                    placeholder="Describe expectations, agenda, and highlights..."
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="startDate">Start Date & Time</Label>
                    <Input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        type="text"
                        id="location"
                        name="location"
                        required
                        placeholder="e.g. Grand Hall, New York"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                        type="number"
                        id="capacity"
                        name="capacity"
                        required
                        min="1"
                        placeholder="e.g. 500"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <Button variant="ghost" asChild>
                    <Link href="/admin">Cancel</Link>
                </Button>
                <SubmitButton />
            </div>
        </form>
    );
}
