"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ComponentPropsWithoutRef } from "react";
import isModifiedEvent from "./is-modified-event";
import useOptimisticPathname from "./use-optimistic-pathname";

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
      {/* <span className="block w-20">&nbsp;{optimisticPathname}</span> */}
      <span className="block w-20">&nbsp;{optimisticState}</span>
    </NextLink>
  );
}
