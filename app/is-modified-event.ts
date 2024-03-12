import { MouseEvent } from "react";

/*
  From next/link:

  https://github.com/vercel/next.js/blob/5278d82aa934ae16b5545af18b33511b99b2b735/packages/next/src/client/link.tsx#L180
*/
export default function isModifiedEvent(event: MouseEvent): boolean {
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
