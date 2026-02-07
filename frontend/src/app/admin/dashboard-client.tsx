"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllEvents, getAllReservations } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  Calendar,
  Users,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  publishEventAction,
  confirmReservationAction,
  refuseReservationAction,
} from "@/lib/actions";
import { EventStatus, ReservationStatus } from "@/types/enums";
import { Event } from "@/types/event";
import { Reservation } from "@/types/reservation";

interface AdminDashboardClientProps {
  token: string;
  initialEvents: Event[];
  initialReservations: Reservation[];
}

export function AdminDashboardClient({
  token,
  initialEvents,
  initialReservations,
}: Readonly<AdminDashboardClientProps>) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Fetch Events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => getAllEvents(token),
    initialData: initialEvents,
  });

  // Fetch Reservations

  const { data: reservations = [], isLoading: reservationsLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: () => getAllReservations(token),
    initialData: initialReservations,
  });

  // Reservation Mutations
  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await confirmReservationAction(id);
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast({
        title: "Reservation Confirmed",
        description: "User has been notified.",
      });
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm.",
      }),
  });

  const refuseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await refuseReservationAction(id);
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast({
        title: "Reservation Refused",
        description: "User has been notified.",
      });
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refuse.",
      }),
  });

  // Publish Event Mutation
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await publishEventAction(id);
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Event Published",
        description: "The event is now visible to all users.",
      });
      setIsPublishDialogOpen(false);
      setSelectedEventId(null);
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish event.",
      }),
  });

  const stats = {
    totalReservations: reservations.length,
    totalEvents: events.length,
    activeReservations: reservations.filter(
      (r: Reservation) => r.status === ReservationStatus.CONFIRMED,
    ).length,
  };

  if (eventsLoading || reservationsLoading) {
    return (
      <div className="p-8 pt-24 text-center text-muted-foreground">
        Loading dashboard data...
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 pt-24">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/events/create">
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Drafts and published
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Confirmed Attendees
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReservations}</div>
            <p className="text-xs text-muted-foreground">Confirmed bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Events List (Left/Start) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>
              Manage your events and view their status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.slice(0, 4).map((event: Event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium leading-none">{event.title}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        event.status === EventStatus.PUBLISHED
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {event.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.status === EventStatus.DRAFT && (
                    <Dialog
                      open={isPublishDialogOpen && selectedEventId === event.id}
                      onOpenChange={(open) => {
                        setIsPublishDialogOpen(open);
                        if (!open) setSelectedEventId(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEventId(event.id)}
                        >
                          <CheckCircle className="mr-2 h-3.5 w-3.5" /> Publish
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Publish Event?</DialogTitle>
                          <DialogDescription>
                            This will make &quot;{event.title}&quot; visible to
                            all users.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsPublishDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => publishMutation.mutate(event.id)}
                          >
                            Confirm Publish
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/events/${event.id}/edit`}>
                      <Edit2 className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Reservations List (Right/End) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardDescription>Latest booking requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reservations.slice(0, 4).map((reservation: Reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-2 border-b last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {reservation.participant?.firstName}{" "}
                      {reservation.participant?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reservation.event?.title}
                    </p>
                    <div
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full ${
                        reservation.status === "Confirmed"
                          ? "bg-green-500/10 text-green-500"
                          : reservation.status === "Pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                      }`}
                    >
                      {reservation.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {reservation.status === ReservationStatus.PENDING && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                          onClick={() => confirmMutation.mutate(reservation.id)}
                          disabled={confirmMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
                          onClick={() => refuseMutation.mutate(reservation.id)}
                          disabled={refuseMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {reservations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reservations yet.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
