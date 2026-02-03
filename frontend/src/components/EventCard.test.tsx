import { render, screen } from '@testing-library/react';
import { EventCard } from './EventCard';
import { EventStatus } from '@/types/enums';
import { Event } from '@/types/event';

const mockEvent: Event = {
    id: 'event-123',
    title: 'Test Event',
    description: 'This is a test event description',
    startDate: new Date('2024-01-01T10:00:00Z').toISOString(),
    endDate: new Date('2024-01-01T12:00:00Z').toISOString(),
    location: 'Test Location',
    capacity: 100,
    reservedCount: 10,
    status: EventStatus.PUBLISHED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

describe('EventCard', () => {
    it('renders event details correctly', () => {
        render(<EventCard event={mockEvent} />);

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('This is a test event description')).toBeInTheDocument();
        expect(screen.getByText('Test Location')).toBeInTheDocument();
        expect(screen.getByText('90 spots left')).toBeInTheDocument();
        expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('shows Sold Out badge when full', () => {
        const fullEvent = { ...mockEvent, reservedCount: 100 };
        render(<EventCard event={fullEvent} />);

        expect(screen.getByText('Sold Out')).toBeInTheDocument();
        expect(screen.getByText('0 spots left')).toBeInTheDocument();
    });

    it('links to the correct details page', () => {
        render(<EventCard event={mockEvent} />);

        const link = screen.getByRole('link', { name: /view details/i });
        expect(link).toHaveAttribute('href', '/events/event-123');
    });
});
