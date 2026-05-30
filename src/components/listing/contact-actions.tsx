"use client";

import { useActionState, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { applyAction } from "@/app/(app)/listing/actions";
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
import { cn } from "@/lib/utils";

export function ContactActions({
  listingId,
  phone,
  title,
  landlordName,
  className,
}: {
  listingId: string;
  phone: string;
  title: string;
  landlordName: string;
  className?: string;
}) {
  const digits = phone.replace(/\D/g, "");
  const waLink = `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hi ${landlordName}, I saw "${title}" on RumahKu. Is it still available? I'd like to arrange a viewing.`,
  )}`;

  const [state, action, pending] = useActionState(applyAction, undefined);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (state?.ok) {
      setOpen(false);
      setMsg("");
      toast.success("Application sent! The landlord will see it on their dashboard.");
    }
  }, [state]);

  return (
    <div className={cn("flex gap-2", className)}>
      <Button
        className="flex-1"
        nativeButton={false}
        render={<a href={waLink} target="_blank" rel="noopener noreferrer" />}
      >
        <MessageCircle /> Chat on WhatsApp
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" className="flex-1" />}>
          Apply
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for this room</DialogTitle>
            <DialogDescription>
              Send a short intro to {landlordName}. They&apos;ll see it on their dashboard
              and can reply on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <form action={action} className="space-y-3">
            {state?.error && (
              <p className="rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{state.error}</p>
            )}
            <input type="hidden" name="listingId" value={listingId} />
            <div className="space-y-1.5">
              <Label htmlFor="apply-msg">Your message</Label>
              <Textarea
                id="apply-msg"
                name="message"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
                rows={4}
                placeholder="Hi! I'm a final-year UMS student looking to move in next month. I'm tidy and quiet…"
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? "Sending…" : "Send application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
