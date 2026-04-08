import { useCallback, useEffect, useState } from "react";

type Options = {
  url: string;
  /** Polling interval in ms (default 5000). */
  intervalMs?: number;
};

/**
 * Fetches a large JSON payload on mount, on interval, and via refetch().
 * In-flight requests are not aborted on unmount (no AbortController).
 */
export function useLargeDataFetch({ url, intervalMs = 5000 }: Options) {
  const [data, setData] = useState<unknown[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json: unknown = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void fetchData();
    const id = setInterval(() => {
      void fetchData();
    }, intervalMs);
    return () => {
      clearInterval(id);
    };
  }, [fetchData, intervalMs]);

  return { data, loading, error, refetch: fetchData };
}
