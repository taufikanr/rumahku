"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  url: string;
}

const BUCKET = "listing-photos";
const MAX = 8;

/** Downscale an image file to a web-friendly JPEG before upload. */
async function downscale(file: File, maxEdge = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.82),
  );
}

export function PhotoUploader({ userId }: { userId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setBusy(true);
    const supabase = createClient();
    const room = MAX - photos.length;
    const chosen = Array.from(files).slice(0, room);

    for (const file of chosen) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const blob = await downscale(file);
        const path = `${userId}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (upErr) {
          setError(upErr.message);
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        setPhotos((p) => [...p, { id: path, url: data.publicUrl }]);
      } catch {
        setError("Couldn't process that image — try another.");
      }
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(p: Photo) {
    setPhotos((list) => list.filter((x) => x.id !== p.id));
    try {
      await createClient().storage.from(BUCKET).remove([p.id]);
    } catch {
      /* best-effort cleanup */
    }
  }

  return (
    <div>
      {photos.map((p) => (
        <input key={p.id} type="hidden" name="photos" value={p.url} />
      ))}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="relative aspect-square overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="Upload preview" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => remove(p)}
              className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remove photo"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {photos.length < MAX && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
              busy && "opacity-60",
            )}
          >
            {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            <span className="text-xs">{busy ? "Uploading…" : "Add photo"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <p className="mt-2 text-xs text-muted-foreground">
        Up to {MAX} photos. Clear, recent photos build trust and reduce scam-risk flags.
      </p>
    </div>
  );
}
