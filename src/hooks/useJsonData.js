import { useEffect, useState } from 'react';

const cache = new Map();

export default function useJsonData(filename) {
  const [data, setData] = useState(() => cache.get(filename) ?? null);
  const [loading, setLoading] = useState(!cache.has(filename));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cache.has(filename)) {
      setData(cache.get(filename));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/data/${filename}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${filename}: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        cache.set(filename, json);
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filename]);

  return { data, loading, error };
}
