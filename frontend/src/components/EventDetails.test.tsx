import { render, screen } from '@testing-library/react';
import { EventDetails } from './EventDetails';
import { EventStatus } from '@/types/enums';
import { Event } from '@/types/event';

// Mock styles since they are imported in component
jest.mock('@/app/events/[id]/page.module.css', () => ({
    main: 'main',
    backLink: 'backLink',
    card: 'card',
    header: 'header',
    metaRow: 'metaRow',
    metaItem: 'metaItem',
    icon: 'icon',
    content: 'content',
    sectionTitle: 'sectionTitle',
    description: 'description',
    actions: 'actions',
}));

// Mock BookButton component since it uses client-side hooks
jest.mock('./BookButton', () => ({
    BookButton: ({ isFull }: { isFull: boolean }) => (
        <button disabled={isFull}>{isFull ? 'Sold Out' : 'Book Now'}</button>
    ),
}));

const mockEvent: Event = {
    id: 'event-123',
    title: 'Detailed Event',
    description: 'Full description here',
    startDate: new Date('2024-01-01T10:00:00Z').toISOString(),
    endDate: new Date('2024-01-01T12:00:00Z').toISOString(),
    location: 'Main Hall',
    capacity: 50,
    reservedCount: 0,
    status: EventStatus.PUBLISHED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

describe('EventDetails', () => {
    it('renders event information correctly', () => {
        render(<EventDetails event={mockEvent} isLoggedIn={false} />);

        expect(screen.getByText('Detailed Event')).toBeInTheDocument();
        expect(screen.getByText('Full description here')).toBeInTheDocument();
        expect(screen.getByText('Main Hall')).toBeInTheDocument();
        expect(screen.getByText(/50 spots remaining/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /book now/i })).toBeInTheDocument();
    });

    it('renders Sold Out state correctly', () => {
        const soldOutEvent = { ...mockEvent, reservedCount: 50 };
        render(<EventDetails event={soldOutEvent} isLoggedIn={false} />);

        expect(screen.getAllByText(/Sold Out/)[0]).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled();
    });
});
