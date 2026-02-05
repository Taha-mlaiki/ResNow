import { Skeleton } from '@/components/Skeleton';
import { EventGrid } from '@/components/EventGrid';

export default function Loading() {
    return (
        <main className="min-h-screen pt-24 pb-16 bg-background">
            <div className="container mx-auto px-6">
                <header className="mb-12 text-center md:text-left">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Skeleton width={50} height={20} />
                        <span>/</span>
                        <Skeleton width={60} height={20} />
                    </div>
                    <Skeleton width={300} height={60} style={{ marginBottom: '1rem' }} />
                    <Skeleton width={400} height={24} />
                </header>

                <EventGrid>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col gap-4 p-6 border rounded-lg bg-card shadow-sm">
                            <div className="flex justify-between items-center">
                                <Skeleton width="60%" height={24} />
                                <Skeleton width={80} height={24} borderRadius={999} />
                            </div>
                            <Skeleton width="100%" height={20} />
                            <Skeleton width="100%" height={20} />

                            <div className="mt-auto flex flex-col gap-2">
                                <Skeleton width="50%" height={16} />
                                <Skeleton width="40%" height={16} />
                                <Skeleton width="30%" height={16} />
                            </div>
                            <Skeleton width="100%" height={48} borderRadius="var(--radius)" style={{ marginTop: '1rem' }} />
                        </div>
                    ))}
                </EventGrid>
            </div>
        </main>
    );
}
