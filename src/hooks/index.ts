"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ── useFetch ────────────────────────────────────────────────────────────────
export function useFetch<T>(url: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return { data, loading, error, refetch: fetch_ };
}

// ── useToast ────────────────────────────────────────────────────────────────
type ToastType = "success" | "error" | "info";
interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  function toast(message: string, type: ToastType = "success") {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }

  return { toasts, toast };
}

// ── useDebounce ─────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

// ── useLocalStorage ─────────────────────────────────────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const item = window.localStorage.getItem(key);
      if (item) setValue(JSON.parse(item));
    } catch {
      // ignore
    }
  }, [key]);

  function set(val: T | ((prev: T) => T)) {
    setValue((prev) => {
      const next =
        typeof val === "function" ? (val as (p: T) => T)(prev) : (val as T);
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  }

  return [value, set] as const;
}
