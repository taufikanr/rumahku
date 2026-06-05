"use client";

import { useActionState, useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { addReviewAction } from "@/app/(app)/listing/actions";
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

export function ReviewForm({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(addReviewAction, undefined);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (state?.ok) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setOpen(false);
      setRating(0);
      setComment("");
      /* eslint-enable react-hooks/set-state-in-effect */
      toast.success("Thanks! Your review has been posted.");
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Star className="size-4" /> Write a review
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Share your honest experience to help other renters decide.
          </DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-3">
          {state?.error && (
            <p className="rounded-lg bg-danger/10 p-2.5 text-sm text-danger">{state.error}</p>
          )}
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="rating" value={rating} />

          <div className="space-y-1.5">
            <Label>Your rating</Label>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      (hover || rating) >= n
                        ? "fill-premium text-premium"
                        : "text-muted-foreground/30",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="review-comment">Your review</Label>
            <Textarea
              id="review-comment"
              name="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              placeholder="How was the room, the landlord, the area? Was the deposit returned fairly?"
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Posting…" : "Post review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
