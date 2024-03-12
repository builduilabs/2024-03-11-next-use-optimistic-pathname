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

// <nav className="flex gap-2 m-2">
//   {[
//     { href: "/", label: "Home" },
//     { href: "/page-1", label: "Page 1" },
//     { href: "/page-2", label: "Page 2" },
//   ].map((link) => (
//     <Link
//       key={link.href}
//       className="data-[optimistic=activating]:text-blue-500 px-3 py-2 rounded data-[state=active]:bg-blue-500 data-[state=active]:text-white"
//       href={link.href}
//     >
//       {link.label}
//     </Link>
//   ))}
// </nav>
