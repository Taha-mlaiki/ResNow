'use client';

import { updateEventAction, publishEventAction } from '@/lib/actions';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Event } from '@/types/event';
import { EventStatus } from '@/types/enums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="min-w-[150px]"
        >
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    );
}

export function EditEventForm({ event }: { event: Event }) {
    const router = useRouter();
    const { toast } = useToast();
    // Bind the ID to the action
    const updateWithId = updateEventAction.bind(null, event.id);

    // Wrapper to satisfy TS (expected void, got Promise<obj>)
    const formAction = async (formData: FormData) => {
        await updateWithId(formData);
    };

    const handlePublish = async () => {
        const res = await publishEventAction(event.id);
        if (res?.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: res.error,
            });
        } else {
            toast({
                title: "Success",
                description: "Event published successfully!",
            });
            router.refresh(); // Refresh to show updated status
        }
    };

    // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    };

    return (
        <form action={formAction} className="flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 border rounded-md bg-muted/20">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${event.status === EventStatus.PUBLISHED
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                        {event.status}
                    </span>
                </div>
                {event.status === EventStatus.DRAFT && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePublish}
                        className="border-green-500/50 text-green-500 hover:bg-green-500/10 hover:text-green-500"
                    >
                        Publish Event
                    </Button>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                    type="text"
                    id="title"
                    name="title"
                    required
                    defaultValue={event.title}
                    maxLength={100}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                    id="description"
                    name="description"
                    required
                    defaultValue={event.description}
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
                        defaultValue={formatDate(event.startDate)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="endDate">End Date & Time</Label>
                    <Input
                        type="datetime-local"
                        id="endDate"
                        name="endDate"
                        required
                        defaultValue={formatDate(event.endDate)}
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
                        defaultValue={event.location}
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
                        defaultValue={event.capacity}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-4 pt-4 border-t">
                <Button variant="ghost" asChild>
                    <Link href="/admin">Cancel</Link>
                </Button>
                <SubmitButton />
            </div>
        </form>
    );
}
