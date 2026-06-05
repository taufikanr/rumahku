"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { requestViewingAction } from "@/app/(app)/viewings/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RequestViewing({
  listingId,
  landlordId,
  listingTitle,
  className,
}: {
  listingId: string;
  landlordId: string;
  listingTitle: string;
  className?: string;
}) {
  const [state, action, pending] = useActionState(requestViewingAction, undefined);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setOpen(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      toast.success("Viewing requested! The landlord will confirm a time.");
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className={className} />}>
        <CalendarClock /> Request a viewing
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a viewing</DialogTitle>
          <DialogDescription>
            Pick a time to view this room in person — always view before paying anything.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-3">
          {state?.error && (
            <p className="rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{state.error}</p>
          )}
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="landlordId" value={landlordId} />
          <input type="hidden" name="listingTitle" value={listingTitle} />
          <div className="space-y-1.5">
            <Label htmlFor="preferredAt">Preferred date &amp; time</Label>
            <input
              id="preferredAt"
              name="preferredAt"
              type="datetime-local"
              required
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vnote">Note (optional)</Label>
            <Textarea
              id="vnote"
              name="note"
              rows={3}
              placeholder="Hi! I'd like to view this room — I'm flexible around this time too."
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Requesting…" : "Request viewing"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
