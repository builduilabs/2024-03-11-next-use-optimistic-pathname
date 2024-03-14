"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ComponentPropsWithoutRef } from "react";
import isModifiedEvent from "./is-modified-event";
import useOptimisticPathname from "./use-optimistic-pathname";

export function OptimisticLink({
  href,
  children,
  ...rest
}: ComponentPropsWithoutRef<typeof NextLink>) {
  const pathname = usePathname();
  const { optimisticPathname, updateOptimisticUrl } = useOptimisticPathname();

  return (
    <NextLink
      href={href}
      className={`px-3 py-2 border-b-4
        ${
          !optimisticPathname && pathname === href
            ? "border-green-500"
            : optimisticPathname === href
            ? "border-yellow-500"
            : "border-gray-300"
        }
      `}
      onClick={(event) => {
        if (!isModifiedEvent(event)) {
          updateOptimisticUrl(`${href}`);
        }
      }}
      {...rest}
    >
      {children}
    </NextLink>
  );
}
