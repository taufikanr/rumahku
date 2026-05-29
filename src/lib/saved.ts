"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "rumahku:saved";
const EVT = "rumahku:saved-change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVT));
}

/** All saved listing IDs, kept in sync across components + tabs. */
export function useSavedIds(): string[] {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(read());
    const handler = () => setIds(read());
    window.addEventListener(EVT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return ids;
}

export function useSaved(id: string) {
  const ids = useSavedIds();
  const saved = ids.includes(id);
  const toggle = useCallback(() => {
    const cur = read();
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }, [id]);
  return { saved, toggle };
}
