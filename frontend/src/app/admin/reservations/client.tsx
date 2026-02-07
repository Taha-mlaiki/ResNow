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
import { CheckCircle, XCircle } from "lucide-react";
import {
  confirmReservationAction,
  refuseReservationAction,
} from "@/lib/actions";
import { ReservationStatus } from "@/types/enums";

import { Reservation } from "@/types/reservation";

interface ReservationsClientProps {
  reservations: Reservation[];
}

export function ReservationsClient({
  reservations,
}: Readonly<ReservationsClientProps>) {
  const { toast } = useToast();

  // Mutations
  const confirmMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await confirmReservationAction(id);
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      // In a real app with caching, we'd invalidate 'reservations'.
      // Since this is a simple page refresh or we might add React Query hydration later,
      // for now we rely on the server action revalidatePath.
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

  return (
    <div className="space-y-8 p-8 pt-24">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">All Reservations</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Management</CardTitle>
          <CardDescription>
            View and manage all booking requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No reservations found.
              </p>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium text-muted-foreground w-[200px]">
                        User
                      </th>
                      <th className="p-4 font-medium text-muted-foreground">
                        Event
                      </th>
                      <th className="p-4 font-medium text-muted-foreground w-[150px]">
                        Date
                      </th>
                      <th className="p-4 font-medium text-muted-foreground w-[120px]">
                        Status
                      </th>
                      <th className="p-4 font-medium text-muted-foreground text-right w-[120px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((res: Reservation) => (
                      <tr
                        key={res.id}
                        className="border-b last:border-0 hover:bg-muted/5 transition-colors"
                      >
                        <td className="p-4 font-medium">
                          {res.participant?.firstName}{" "}
                          {res.participant?.lastName}
                          <div className="text-xs text-muted-foreground font-normal">
                            {res.participant?.email}
                          </div>
                        </td>
                        <td className="p-4">{res.event?.title}</td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(res.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {(() => {
                            const getStatusClass = (
                              status: ReservationStatus,
                            ): string => {
                              if (status === ReservationStatus.CONFIRMED) {
                                return "bg-green-100 text-green-700";
                              }
                              if (status === ReservationStatus.PENDING) {
                                return "bg-yellow-100 text-yellow-800";
                              }
                              return "bg-red-100 text-red-700";
                            };
                            const statusClass = getStatusClass(res.status);
                            return (
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
                              >
                                {res.status}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="p-4 text-right">
                          {res.status === ReservationStatus.PENDING && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                                onClick={() => confirmMutation.mutate(res.id)}
                                disabled={confirmMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100"
                                onClick={() => refuseMutation.mutate(res.id)}
                                disabled={refuseMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
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
