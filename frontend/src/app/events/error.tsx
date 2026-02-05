'use client';

import { useEffect } from 'react';
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
        <main className="min-h-screen pt-24 pb-16 bg-background">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-red-500/5 border-red-500/20 backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4 text-destructive">Something went wrong!</h2>
                    <p className="text-muted-foreground mb-8">We couldn&apos;t load the events. Please try again later.</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </div>
        </main>
    );
}
