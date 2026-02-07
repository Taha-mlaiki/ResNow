"use client";

import { useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Edit2, Plus } from "lucide-react";
import Link from "next/link";
import { publishEventAction } from "@/lib/actions";
import { EventStatus } from "@/types/enums";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Event } from "@/types/event";

interface EventsClientProps {
  events: Event[];
}

export function EventsClient({ events }: Readonly<EventsClientProps>) {
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);

  // Publish Mutation
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await publishEventAction(id);
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      // Note: In a real app we would invalidate queries, but since we are navigating or refreshing,
      // the server component usually handles data.
      // If using pure client-side fetching as primary, we'd invalidate here.
      toast({
        title: "Event Published",
        description: "The event is now public.",
      });
      setIsPublishDialogOpen(false);
    },
    onError: () =>
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish.",
      }),
  });

  return (
    <div className="space-y-8 p-8 pt-24">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">All Events</h2>
        <Button asChild>
          <Link href="/events/create">
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
          <CardDescription>
            View, edit, and publish your events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No events found.
              </p>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="p-4 font-medium text-muted-foreground w-[150px]">
                        Date
                      </th>
                      <th className="p-4 font-medium text-muted-foreground w-[150px]">
                        Location
                      </th>
                      <th className="p-4 font-medium text-muted-foreground w-[120px]">
                        Status
                      </th>
                      <th className="p-4 font-medium text-muted-foreground text-right w-[180px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr
                        key={event.id}
                        className="border-b last:border-0 hover:bg-muted/5 transition-colors"
                      >
                        <td className="p-4 font-medium">{event.title}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {event.location}
                        </td>
                        <td className="p-4">
                          {(() => {
                            let statusColorClass: string;
                            if (event.status === EventStatus.PUBLISHED) {
                              statusColorClass = "bg-green-100 text-green-700";
                            } else if (event.status === EventStatus.DRAFT) {
                              statusColorClass =
                                "bg-yellow-100 text-yellow-800";
                            } else {
                              statusColorClass = "bg-red-100 text-red-700"; // Canceled
                            }
                            return (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColorClass}`}
                              >
                                {event.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            {event.status === EventStatus.DRAFT && (
                              <Dialog
                                open={
                                  isPublishDialogOpen &&
                                  selectedEventId === event.id
                                }
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
                                    className="h-8"
                                  >
                                    Publish
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Publish Event?</DialogTitle>
                                    <DialogDescription>
                                      This will make &quot;{event.title}&quot;
                                      visible to all users.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button
                                      variant="outline"
                                      onClick={() =>
                                        setIsPublishDialogOpen(false)
                                      }
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        publishMutation.mutate(event.id)
                                      }
                                    >
                                      Confirm Publish
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 w-8 p-0"
                            >
                              <Link href={`/events/${event.id}/edit`}>
                                <Edit2 className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
