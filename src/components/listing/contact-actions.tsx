"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
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
  phone,
  title,
  landlordName,
  className,
}: {
  phone: string;
  title: string;
  landlordName: string;
  className?: string;
}) {
  const digits = phone.replace(/\D/g, "");
  const waLink = `https://wa.me/${digits}?text=${encodeURIComponent(
    `Hi ${landlordName}, I saw "${title}" on RumahKu. Is it still available? I'd like to arrange a viewing.`,
  )}`;
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

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
              Send a short intro to {landlordName}. They&apos;ll get back to you on WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              setMsg("");
              toast.success("Application sent! The landlord will contact you on WhatsApp.");
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor="apply-msg">Your message</Label>
              <Textarea
                id="apply-msg"
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
              <Button type="submit">Send application</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
