import { CreateEventForm } from './form';

export default function CreateEventPage() {
    return (
        <main className="min-h-screen py-16 flex justify-center">
            <div className="w-full max-w-4xl px-6">
                <div className="p-10 rounded-lg bg-card border shadow-sm">
                    <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
                    <p className="text-muted-foreground mb-8">Fill in the details to publish a new event.</p>
                    <CreateEventForm />
                </div>
            </div>
        </main>
    );
}
