import { useReducedMotion } from "framer-motion";

/**
 * Centralna konfiguracja animacji szanująca `prefers-reduced-motion`.
 *
 * Globalna media query w index.css zatrzymuje czyste CSS transitions,
 * ale framer-motion ma własny system — `useReducedMotion` zwraca true
 * gdy user ma włączoną redukcję ruchu, wtedy zwracamy zerowe duration
 * (instant snap zamiast tween).
 *
 * Ease curve `[0.16, 1, 0.3, 1]` to ease-out z Linear marketing site
 * — soft start, gentle landing.
 */
export function useMotionConfig() {
  const prefersReduced = useReducedMotion();

  const fast = { duration: prefersReduced ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] as const };
  const base = { duration: prefersReduced ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] as const };
  const slow = { duration: prefersReduced ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] as const };

  return {
    /** True gdy user ma `prefers-reduced-motion: reduce` */
    prefersReduced,
    /** 180ms — micro interactions (button press, tooltip) */
    fast,
    /** 240ms — domyślne UI transitions (drawer, dialog, fade) */
    base,
    /** 320ms — większe układy (page transition, full layout) */
    slow,
  } as const;
}
