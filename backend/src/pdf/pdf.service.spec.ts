import { Test, TestingModule } from '@nestjs/testing';
import { PdfService } from './pdf.service';
import { ReservationStatus } from '../reservations/enums/reservation-status.enum';

describe('PdfService', () => {
    let service: PdfService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PdfService],
        }).compile();

        service = module.get<PdfService>(PdfService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateTicket', () => {
        const mockReservation = {
            id: 'reservation-123',
            status: ReservationStatus.CONFIRMED,
            createdAt: new Date('2024-01-15T10:00:00Z'),
            participant: {
                id: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
            },
            event: {
                id: 'event-123',
                title: 'Tech Conference 2024',
                description: 'Annual technology conference',
                startDate: new Date('2024-03-20T09:00:00Z'),
                endDate: new Date('2024-03-20T17:00:00Z'),
                location: 'Convention Center, New York',
            },
        } as any;

        it('should generate a PDF buffer', async () => {
            const pdfBuffer = await service.generateTicket(mockReservation);

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
        });

        it('should generate a valid PDF with correct header', async () => {
            const pdfBuffer = await service.generateTicket(mockReservation);

            // PDF files start with %PDF
            const pdfHeader = pdfBuffer.toString('utf-8', 0, 4);
            expect(pdfHeader).toBe('%PDF');
        });

        it('should generate PDF with reasonable size', async () => {
            const pdfBuffer = await service.generateTicket(mockReservation);

            // PDF should be at least 1KB and less than 1MB
            expect(pdfBuffer.length).toBeGreaterThan(1024);
            expect(pdfBuffer.length).toBeLessThan(1024 * 1024);
        });

        it('should handle event without description', async () => {
            const reservationWithoutDescription = {
                ...mockReservation,
                event: {
                    ...mockReservation.event,
                    description: null,
                },
            };

            const pdfBuffer = await service.generateTicket(
                reservationWithoutDescription,
            );

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
        });

        it('should generate different PDFs for different reservations', async () => {
            const reservation1 = mockReservation;
            const reservation2 = {
                ...mockReservation,
                id: 'reservation-456',
                participant: {
                    ...mockReservation.participant,
                    firstName: 'Jane',
                    lastName: 'Smith',
                },
            };

            const pdf1 = await service.generateTicket(reservation1);
            const pdf2 = await service.generateTicket(reservation2);

            expect(pdf1).not.toEqual(pdf2);
        });

        it('should generate consistent PDF for same reservation', async () => {
            const pdf1 = await service.generateTicket(mockReservation);
            const pdf2 = await service.generateTicket(mockReservation);

            // PDFs should be similar in size (within 10%)
            const sizeDiff = Math.abs(pdf1.length - pdf2.length);
            const avgSize = (pdf1.length + pdf2.length) / 2;
            expect(sizeDiff / avgSize).toBeLessThan(0.1);
        });
    });
});
