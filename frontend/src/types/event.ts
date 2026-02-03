import { EventStatus } from './enums';

export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    capacity: number;
    reservedCount: number;
    status: EventStatus;
    createdAt: string;
    updatedAt: string;
}
