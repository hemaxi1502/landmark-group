import {useCallback, useEffect, useState} from 'react';
const EVENT = 'local-list-change';
function read(key) {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? '[]');
  } catch {
    return [];
  }
}
function write(key, items) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(EVENT, {detail: key}));
  } catch {
    // storage blocked (private mode) – the feature silently degrades
  }
}
export function useLocalProductList(key, max = 20) {
  // Start empty on the server and first client render to avoid hydration mismatch.
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(read(key));
    const sync = () => setItems(read(key));
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [key]);
  const has = useCallback(
    (handle) => items.some((i) => i.handle === handle),
    [items],
  );
  const add = useCallback(
    (product) => {
      const next = [
        product,
        ...read(key).filter((i) => i.handle !== product.handle),
      ].slice(0, max);
      write(key, next);
    },
    [key, max],
  );
  const remove = useCallback(
    (handle) =>
      write(
        key,
        read(key).filter((i) => i.handle !== handle),
      ),
    [key],
  );
  const toggle = useCallback(
    (product) =>
      read(key).some((i) => i.handle === product.handle)
        ? remove(product.handle)
        : add(product),
    [key, add, remove],
  );
  return {items, has, add, remove, toggle};
}
