import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  localStorage.clear();
});

// Default `prefers-reduced-motion: no-preference`.
// Test może nadpisać przez window.matchMedia mock przed renderem.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom nie ma scrollIntoView (używane przez Radix popovers).
Element.prototype.scrollIntoView = vi.fn();
