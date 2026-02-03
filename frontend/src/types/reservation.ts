import { ReservationStatus } from './enums';

export interface Reservation {
    id: string;
    status: ReservationStatus;
    createdAt: string;
    updatedAt: string;
    event: {
        id: string;
        title: string;
        startDate: string;
        endDate: string;
        location: string;
    };
    participant: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}
