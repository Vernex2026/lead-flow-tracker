import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

function subscribe(notify: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
}

const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT;
const getServerSnapshot = () => false;

/**
 * Reactive viewport width subscription via `useSyncExternalStore`.
 * Idiomatyczne dla external store (matchMedia) — eliminuje setState w effect.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
