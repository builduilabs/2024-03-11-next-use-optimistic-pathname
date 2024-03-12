"use client";

import Link from "next/link";
import useOptimisticPathname from "./use-optimistic-pathname";
import isModifiedEvent from "./is-modified-event";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const { optimisticPathname, updateOptimisticUrl } = useOptimisticPathname();

  return (
    <nav className="flex gap-2 m-2 border border-gray-600 p-2">
      {[
        { href: "/", label: "Home" },
        { href: "/page-1", label: "Page 1" },
        { href: "/page-2", label: "Page 2" },
      ].map((link) => (
        <Link
          key={link.href}
          onClick={(event) => {
            if (!isModifiedEvent(event)) {
              updateOptimisticUrl(link.href);
            }
          }}
          className={`px-3 py-2 border-b-4 
            ${
              !optimisticPathname && pathname === link.href
                ? "border-green-500"
                : optimisticPathname === link.href
                ? "border-yellow-500"
                : "border-gray-300"
            }
          `}
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
