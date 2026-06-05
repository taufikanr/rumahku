"use client";

import { LANGS, LANG_COOKIE, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** EN / BM toggle — persists the choice in a cookie and reloads. */
export function LanguageSwitcher({ lang, className }: { lang: Lang; className?: string }) {
  function set(code: Lang) {
    if (code === lang) return;
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `${LANG_COOKIE}=${code}; path=/; max-age=31536000`;
    window.location.reload();
  }
  return (
    <div className={cn("inline-flex rounded-lg border border-border bg-card p-0.5", className)}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => set(l.code)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-bold transition-colors",
            lang === l.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={lang === l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
