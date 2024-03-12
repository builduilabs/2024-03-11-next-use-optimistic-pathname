"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  ComponentPropsWithoutRef,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

export function Link({
  href,
  children,
  ...rest
}: ComponentPropsWithoutRef<typeof NextLink>) {
  const pathname = usePathname();
  const state = pathname === href ? "active" : "inactive";

  const { optimisticPathname, updateOptimisticUrl } = useOptimisticPathname();

  const optimisticState =
    optimisticPathname && state === "active"
      ? "deactivating"
      : optimisticPathname === href
      ? "activating"
      : undefined;

  return (
    <NextLink
      {...rest}
      onClick={(event) => {
        if (!isModifiedEvent(event)) {
          updateOptimisticUrl(`${href}`);
        }
      }}
      href={href}
    >
      {children}
      <span className="block w-20">&nbsp;{state}</span>
      <span className="block w-20">&nbsp;{optimisticPathname}</span>
      <span className="block w-20">&nbsp;{optimisticState}</span>
    </NextLink>
  );
}

function useOptimisticPathname() {
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
  typeof window !== undefined && window.location.pathname;
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

function useDebounced(value: any, timeout: number) {
  let [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    let timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, timeout);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, timeout]);

  return debouncedValue;
}

function isModifiedEvent(event: React.MouseEvent): boolean {
  const eventTarget = event.currentTarget as HTMLAnchorElement | SVGAElement;
  const target = eventTarget.getAttribute("target");
  return (
    (target && target !== "_self") ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey || // triggers resource download
    (event.nativeEvent && event.nativeEvent.which === 2)
  );
}
