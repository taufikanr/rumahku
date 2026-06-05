"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";
import { addEvidenceAction } from "@/app/(app)/deposits/actions";
import { PhotoUploader } from "@/components/landlord/photo-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SELECT_CLS =
  "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

/** Log timestamped condition evidence (photos + note) at move-in or move-out. */
export function EvidenceForm({ depositId, userId }: { depositId: string; userId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={addEvidenceAction}
      className="space-y-3 rounded-2xl border border-border/70 bg-card p-4"
    >
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Camera className="size-4 text-primary" /> Add condition evidence
      </p>
      <input type="hidden" name="depositId" value={depositId} />
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="phase">Stage</Label>
          <select id="phase" name="phase" className={SELECT_CLS} defaultValue="movein">
            <option value="movein">Move-in</option>
            <option value="moveout">Move-out</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="evnote">Note (optional)</Label>
          <Textarea
            id="evnote"
            name="note"
            rows={2}
            placeholder="e.g. Small scratch on the desk; everything else in good condition."
          />
        </div>
      </div>
      <PhotoUploader userId={userId} />
      <Button type="submit" size="sm">
        Save evidence
      </Button>
    </form>
  );
}
