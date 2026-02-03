import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Reservation } from '../reservations/entities/reservation.entity';

@Injectable()
export class PdfService {
  /**
   * Generate a PDF ticket for a confirmed reservation
   * @param reservation - The reservation to generate a ticket for
   * @returns Buffer containing the PDF
   */
  async generateTicket(reservation: Reservation): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
        });

        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('EVENT TICKET', { align: 'center' })
          .moveDown(0.5);

        // Divider line
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(1);

        // Event Information
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Event Details', { underline: true })
          .moveDown(0.5);

        doc.fontSize(12).font('Helvetica');

        doc
          .font('Helvetica-Bold')
          .text('Event: ', { continued: true })
          .font('Helvetica')
          .text(reservation.event.title)
          .moveDown(0.3);

        if (reservation.event.description) {
          doc
            .font('Helvetica-Bold')
            .text('Description: ', { continued: true })
            .font('Helvetica')
            .text(reservation.event.description)
            .moveDown(0.3);
        }

        doc
          .font('Helvetica-Bold')
          .text('Date: ', { continued: true })
          .font('Helvetica')
          .text(
            `${new Date(reservation.event.startDate).toLocaleString('en-US')} - ${new Date(reservation.event.endDate).toLocaleString('en-US')}`,
          )
          .moveDown(0.3);

        doc
          .font('Helvetica-Bold')
          .text('Location: ', { continued: true })
          .font('Helvetica')
          .text(reservation.event.location)
          .moveDown(1);

        // Participant Information
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Participant Details', { underline: true })
          .moveDown(0.5);

        doc.fontSize(12).font('Helvetica');

        doc
          .font('Helvetica-Bold')
          .text('Name: ', { continued: true })
          .font('Helvetica')
          .text(
            `${reservation.participant.firstName} ${reservation.participant.lastName}`,
          )
          .moveDown(0.3);

        doc
          .font('Helvetica-Bold')
          .text('Email: ', { continued: true })
          .font('Helvetica')
          .text(reservation.participant.email)
          .moveDown(1);

        // Reservation Information
        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Reservation Details', { underline: true })
          .moveDown(0.5);

        doc.fontSize(12).font('Helvetica');

        doc
          .font('Helvetica-Bold')
          .text('Reservation ID: ', { continued: true })
          .font('Helvetica')
          .text(reservation.id)
          .moveDown(0.3);

        doc
          .font('Helvetica-Bold')
          .text('Status: ', { continued: true })
          .font('Helvetica')
          .fillColor('green')
          .text(reservation.status)
          .fillColor('black')
          .moveDown(0.3);

        doc
          .font('Helvetica-Bold')
          .text('Booked on: ', { continued: true })
          .font('Helvetica')
          .text(new Date(reservation.createdAt).toLocaleString('en-US'))
          .moveDown(2);

        // Footer
        doc
          .fontSize(10)
          .font('Helvetica-Oblique')
          .fillColor('gray')
          .text(
            'Please present this ticket at the event entrance. Keep it safe!',
            { align: 'center' },
          )
          .moveDown(0.5);

        doc
          .fontSize(8)
          .text(`Generated on ${new Date().toLocaleString('en-US')}`, {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
