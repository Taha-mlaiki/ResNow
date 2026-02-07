import { getSession } from "@/lib/auth";
import { getMyReservations } from "@/lib/api";
import { ReservationList } from "@/components/ReservationList";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar } from "lucide-react";
import styles from "./page.module.css";
import { Reservation } from "@/types/reservation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const token = await getSession();

  if (!token) {
    redirect("/login");
  }

  let reservations: Reservation[] = [];
  try {
    reservations = await getMyReservations(token);
  } catch (error: unknown) {
    console.error("Failed to fetch reservations", error);
    // If unauthorized, redirect to login to refresh token
    if (
      typeof error === "object" &&
      error &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string" &&
      ((error as { message: string }).message.includes("401") ||
        (error as { message: string }).message.includes("Unauthorized"))
    ) {
      redirect("/login");
    }
  }

  return (
    <main className={styles.main}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>My Reservations</h1>
          <p className={styles.subtitle}>Manage your bookings and tickets</p>
        </header>

        {reservations.length > 0 ? (
          <ReservationList initialReservations={reservations} token={token} />
        ) : (
          <div className={`${styles.empty} glass`}>
            <Calendar size={48} className={styles.emptyIcon} />
            <h2>No reservations yet</h2>
            <p>You haven&apos;t booked any events yet.</p>
            <Link
              href="/events"
              className="btn btn-primary"
              style={{ marginTop: "1.5rem" }}
            >
              Browse Events
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
