import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from './api';
import type { PageMeta, Paged } from './types';

export const errorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    const detail = err.details?.map((d) => `${d.path}: ${d.message}`).join('; ');
    return detail ? `${err.message} (${detail})` : err.message;
  }
  return err instanceof Error ? err.message : 'Unexpected error';
};

// Fetches one page of a paginated endpoint. `filters` are whatever the fetcher depends on,
// changing them sends you back to page 1.
export function usePaged<T>(fetcher: (page: number) => Promise<Paged<T>>, filters: unknown[] = []) {
  const filterKey = JSON.stringify(filters);
  const [page, setPage] = useState(1);
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  const [reloads, setReloads] = useState(0);
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // reset the page while rendering, so we never fetch the old page with the new filters
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  // always call the latest fetcher without making it an effect dependency
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let stale = false; // ignore responses that arrive after the page/filters changed
    fetcherRef
      .current(page)
      .then((res) => {
        if (stale) return;
        setItems(res.data);
        setMeta(res.meta);
        setError('');
      })
      .catch((e) => !stale && setError(errorMessage(e)))
      .finally(() => !stale && setLoading(false));
    return () => {
      stale = true;
    };
  }, [page, filterKey, reloads]);

  const reload = useCallback(() => setReloads((n) => n + 1), []);

  return { items, meta, error, loading, page, setPage, reload };
}
