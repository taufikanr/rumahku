import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "@/lib/i18n";

/** The active language from the cookie (defaults to English). Server-only. */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === "ms" ? "ms" : "en";
}
