import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import useDebounced from "./use-debounced";

export default function useOptimisticPathname() {
  const pathname = usePathname();
  const optimisticUrl = useSyncExternalStore(
    optimsticUrlStore.subscribe,
    optimsticUrlStore.getSnapshot,
    () => pathname
  );

  const debouncedOptimisticUrl = useDebounced(optimisticUrl, 100);
  const isTransitioning =
    pathname !== optimisticUrl && pathname !== debouncedOptimisticUrl;

  let optimisticPathname = isTransitioning ? debouncedOptimisticUrl : undefined;

  return {
    optimisticPathname,
    updateOptimisticUrl: optimsticUrlStore.updateOptimisticUrl,
  };
}

let optimisticUrlState =
  typeof window !== undefined ? window.location.pathname : undefined;
let listeners: (() => void)[] = [];

if (typeof window !== undefined) {
  window.addEventListener("popstate", () => {
    optimsticUrlStore.updateOptimisticUrl(location.pathname);
  });
}

const optimsticUrlStore = {
  updateOptimisticUrl(url: string) {
    optimisticUrlState = url;
    for (let listener of listeners) {
      listener();
    }
  },
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return optimisticUrlState;
  },
};
