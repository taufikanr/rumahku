"use client";

import { Trash2 } from "lucide-react";
import { deleteListingAction } from "@/app/(app)/dashboard/actions";
import { Button } from "@/components/ui/button";

export function DeleteListingButton({ id }: { id: string }) {
  return (
    <form
      action={deleteListingAction}
      onSubmit={(e) => {
        if (!confirm("Delete this listing? This can't be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="icon-sm" aria-label="Delete listing">
        <Trash2 className="text-danger" />
      </Button>
    </form>
  );
}
