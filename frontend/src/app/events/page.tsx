import { getPublishedEvents } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { EventGrid } from '@/components/EventGrid';
import { Event } from '@/types/event';
import Link from 'next/link';

// Revalidate every 60 seconds (ISR) or force dynamic if preferred
// export const revalidate = 60; 
export const dynamic = 'force-dynamic'; // For real-time updates during dev

export default async function EventsPage() {
    let events: Event[] = [];
    try {
        events = await getPublishedEvents();
    } catch (error) {
        console.error('Failed to fetch events', error);
    }

    return (
        <main className="min-h-screen py-24 bg-background">
            <div className="container mx-auto px-6">
                <header className="mb-12 text-center md:text-left">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <span>Events</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Upcoming Events
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        Explore our curated selection of exclusive experiences.
                    </p>
                </header>

                {events.length > 0 ? (
                    <EventGrid>
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </EventGrid>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card/50 backdrop-blur-sm shadow-sm">
                        <h2 className="text-2xl font-bold mb-2">No events found</h2>
                        <p className="text-muted-foreground">Check back later for new upcoming events.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
