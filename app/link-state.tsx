"use client";

import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ComponentPropsWithoutRef,
  startTransition,
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
  const router = useRouter();
  const optimisticUrl = useSyncExternalStore(
    optimsticUrlStore.subscribe,
    optimsticUrlStore.getSnapshot,
    () => pathname
  );

  let state = pathname === href ? "active" : "inactive";

  // works for optimisticState
  let optimisticState;
  let debouncedOptimisticUrl = useDebounced(optimisticUrl, 60);
  let isTransitioning =
    pathname !== optimisticUrl && pathname !== debouncedOptimisticUrl;

  if (isTransitioning && optimisticUrl === href) {
    optimisticState = "activating";
  } else if (isTransitioning && pathname === href) {
    optimisticState = "deactivating";
  }

  return (
    <NextLink
      {...rest}
      // data-state={state}
      // data-optimistic={optimisticState}
      onClick={(event) => {
        // if is unmodified left click
        if (event.button === 0 && !event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          startTransition(() => {
            optimsticUrlStore.updateOptimsticUrl(`${href}`);
            router.push(`${href}`);
          });
        }
      }}
      href={href}
    >
      {children}
      <span className="block w-20">&nbsp;{state}</span>
      <span className="block w-20">&nbsp;{optimisticState}</span>
    </NextLink>
  );
}

let optimisticUrl = "/";
let listeners: (() => void)[] = [];

const optimsticUrlStore = {
  updateOptimsticUrl(url: string) {
    optimisticUrl = url;
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
    return optimisticUrl;
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
