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

  let optimisticState;
  let debouncedOptimisticUrl = useDebounced(optimisticUrl, 60);
  let isTransitioning =
    pathname !== optimisticUrl && pathname !== debouncedOptimisticUrl;

  if (isTransitioning && optimisticUrl === href) {
    optimisticState = "activating";
  } else if (isTransitioning && pathname === href) {
    optimisticState = "deactivating";
  }

  // if (isTransitioning) {
  //   if (optimisticUrl === href) {
  //     optimisticState = "optimistic";
  //   } else if (pathname === href) {
  //     optimisticState = "deactivating";
  //   }
  // }

  // optimisticState = useDebounced(optimisticState, 60);

  // works
  // let state;
  // if (pathname === optimisticUrl) {
  //   // we're settled
  //   state = pathname === href ? "active" : "inactive";
  // } else {
  //   // we're transitioning
  //   if (optimisticUrl === href) {
  //     state = "optimistic";
  //   } else if (pathname === href) {
  //     state = "deactivating";
  //   } else {
  //     state = "inactive";
  //   }
  // }

  // state = useDebounced(state, 60);

  // let debouncedOptimisticUrl = useDebounced(optimisticUrl, 30);
  // let isDebounced = debouncedOptimisticUrl === optimisticUrl;
  // let isTransitioning = isDebounced && debouncedOptimisticUrl !== pathname;

  /*
    optimisticUrl: /page-1
    debouncedOptimisticUrl: /

    optimisticUrl: /page-2
    debouncedOptimisticUrl: /page-1
    pathname: /
    href: /
    isDebounced: false
  */

  // if (pathname === href && optimisticUrl !== href) {
  //   state = "deactivating";
  // } else if (pathname !== href && optimisticUrl === href) {
  //   state = "optimistic";
  // } else if (pathname === href) {
  //   state = "active";
  // } else {
  //   state = "inactive";
  // }

  // let debouncedState = useDebounced(state, 30);

  // if (href === "/") {
  //   console.log(state);
  // }

  // works
  // if (optimisticUrl === href && optimisticUrl !== pathname) {
  //   // we're transitioning to this link, but it's been under 60ms
  //   if (debouncedOptimisticUrl !== optimisticUrl) {
  //     state = "inactive";
  //   } else {
  //     state = "optimistic";
  //   }
  // } else if (pathname === href || optimisticUrl === href) {
  //   state = "active";
  // } else {
  //   state = "inactive";
  // }

  return (
    <NextLink
      {...rest}
      // data-state={state}
      onClick={(event) => {
        // if is unmodified left click
        if (event.button === 0 && !event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          optimsticUrlStore.updateOptimsticUrl(`${href}`);
          startTransition(() => {
            router.push(`${href}`);
          });
        }
      }}
      href={href}
    >
      {children}
      <span className="block w-16">&nbsp;{state}</span>
      <span className="block w-16">&nbsp;{optimisticState}</span>
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
