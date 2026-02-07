import { getEvent } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { EventDetails } from "@/components/EventDetails";

// Revalidate every 60 seconds
// export const revalidate = 60;
export const dynamic = "force-dynamic";

export default async function EventDetailsPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let event;
  let token;
  try {
    event = await getEvent(id);
    token = await getSession();
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen pt-24 pb-16 bg-background">
      <EventDetails event={event} isLoggedIn={!!token} />
    </main>
  );
}
