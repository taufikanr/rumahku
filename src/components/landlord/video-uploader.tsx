"use client";

import { useRef, useState } from "react";
import { Loader2, Video, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BUCKET = "listing-photos";
const MAX_MB = 60;

/** Uploads a single walkthrough video to storage and emits its URL via a hidden input. */
export function VideoUploader({ userId }: { userId: string }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Video must be under ${MAX_MB}MB. Try a shorter clip.`);
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `${userId}/walkthrough-${crypto.randomUUID()}.${ext}`;
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) {
        setError(upErr.message);
      } else {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        setUrl(data.publicUrl);
      }
    } catch {
      setError("Upload failed — please try again.");
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {url && <input type="hidden" name="walkthrough" value={url} />}
      {url ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <video src={url} controls className="aspect-video w-full bg-black" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Remove video"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-8 text-muted-foreground transition-colors hover:border-primary hover:text-primary",
            busy && "opacity-60",
          )}
        >
          {busy ? <Loader2 className="size-6 animate-spin" /> : <Video className="size-6" />}
          <span className="text-sm font-medium">
            {busy ? "Uploading video…" : "Upload a walkthrough video"}
          </span>
          <span className="text-xs">A short clip earns a “Verified walkthrough” badge</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
