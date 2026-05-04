# Changelog

Wszystkie istotne zmiany w projekcie są dokumentowane w tym pliku.

Format wzorowany na [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
projekt używa [Semantic Versioning](https://semver.org/lang/pl/).

## [Unreleased]

### Added

- **CI/CD pipeline** ([.github/workflows/ci.yml](.github/workflows/ci.yml)) — lint + type-check + format + test + build na każdym PR/push do main
- **Pre-commit hook** ([.husky/pre-commit](.husky/pre-commit)) z lint-staged (ESLint --fix + Prettier --write na changed files)
- **Vercel deploy config** ([vercel.json](vercel.json)) z SPA rewrites, cache-control immutable na `/assets/*`, security headers (X-Frame-Options DENY, Permissions-Policy, X-Content-Type-Options)
- **Frontend password gate** z SHA-256 + 24h sesją w localStorage + blur effect na zablokowanym UI
- **Architektura modułowa** — split LejkiPanel z 256 → 60 linii (`AppHeader`, `MobileDrawer`, `SectionRouter`, `LejkiSection`, `EditableCard` compound component)
- **`useFilteredEvents` hook** wydzielony z HistoryColumn (47 linii inline filter logic → osobny hook + 7 testów)
- **`useMotionConfig` hook** — wrapper na framer-motion `useReducedMotion()` + 3 transition presets (fast/base/slow)
- **`EditableCard` compound component** — wspólny pattern dla StatusCard + ScoringCard (eliminuje 80+ linii duplikacji)
- **28 unit testów** w 4 plikach: store derives, format utilities, password gate, useFilteredEvents
- **Coverage thresholds**: 60% lines/functions/statements, 50% branches
- **JSDoc** na public API: `applyPayloadPatch`, `useCountUp`, `useFilteredEvents`, `useMotionConfig`, `EditableCard`, `EventEditPopover`
- **`PasswordGate` component** z dramatic blur effect (filter: blur(14px) saturate(1.1)) + `inert` na background, role="dialog" aria-modal
- **PWA manifest** ([public/manifest.json](public/manifest.json))
- **CONTRIBUTING / LICENSE / CHANGELOG** dla repo hygiene

### Changed

- **TypeScript strict mode** — `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch` (z `false` we wszystkich)
- **ESLint hardened** — `@typescript-eslint/no-unused-vars: error` (z `^_` escape), `no-explicit-any: error`, `no-console: warn`
- **Brand color** zmieniony z czerwieni `hsl(354 70% 54%)` na **Linear lavender** `hsl(232 56% 60%)` — eliminuje konflikt semantyczny z `--danger` (ten sam hue)
- **Light mode contrast bump** — `--ink-3` z 47% → 40% lightness (4.5:1 → 6:1 na surface-2), `--ink-4` z 65% → 55% (3:1 → 4.6:1)
- **Mobile drawer** — `bg-black/60 backdrop-blur-[2px]` → `bg-ink-1/40 backdrop-blur-md`, `boxShadow` inline → `shadow-2xl`, `role="dialog" aria-modal` dodane
- **Edit pencil w timeline** — `opacity-0 group-hover:opacity-100` → `opacity-100 md:opacity-0 md:group-hover:opacity-100` (touch devices nie mają hovera)
- **Dark mode** — ręczny toggle `document.documentElement.classList.toggle()` → `next-themes` z system preference + persistence + zero FOUC
- **Cards** (Status / Scoring / Owner): `p-6 → p-5`, usunięte `hover:-translate-y-px hover:shadow-sm` (anti-pattern dla niełaklikalnych kart)
- **TimelineEvent** owinięte w `React.memo` — re-renderuje się tylko gdy event się zmieni (nie na każde rodzicielskie state change)
- **`useCountUp`** — startRef pattern zamiast pamiętania `v` z poprzedniej tury (poprawne deps array, brak `eslint-disable`)
- **discriminated union narrowing** w `lejkiStore.updateEvent` przez `applyPayloadPatch` switch — eliminuje 2× `as any`
- **`<html lang="en">` → `lang="pl"`** (krytyczny a11y/SEO bug — app jest po polsku)
- **`index.html`** kompletnie przepisany: title, meta description, OG tags, Twitter Card, theme-color, canonical, manifest link
- **`download="..."` na link GitHub** usunięty (Chromium ignoruje na cross-origin) — dodany `target="_blank" rel="noopener noreferrer"`
- **Repo public** (było private — ZIP download nie działał)

### Removed

- **6 nieużywanych dependencies** (~105 KB gzip): `@tanstack/react-query`, `recharts`, `embla-carousel-react`, `vaul`, `input-otp`, `react-resizable-panels`
- **17 nieużywanych @radix-ui primitives** (accordion, alert-dialog, aspect-ratio, avatar, checkbox, collapsible, context-menu, dialog, label, menubar, navigation-menu, progress, radio-group, scroll-area, separator, slider, switch, toggle, toggle-group)
- **35 plików shadcn UI** (z 47 → zostaje 13 essential): button, calendar, dropdown-menu, hover-card, input, popover, select, skeleton, sonner, tabs, toast, toaster, tooltip
- `zod`, `@radix-ui/react-label`, `@tailwindcss/typography`, `cmdk`, `react-hook-form`, `@hookform/resolvers` (dependencies form/validation niepotrzebne)
- `placeholder.svg` z `public/`
- `initialEvents`, `lead` dead exports z `fixtures.ts`
- ESLint warnings w shadcn ui/ usuniętych plikach

### Fixed

- **TS error** w `OwnerCard.tsx:15` — `<Avatar size={36}>` (poza union `20|24|32|40`) → `size={32}`
- **2× `as any`** w `lejkiStore.ts` i `HistoryColumn.tsx` (proper discriminated union narrowing + typed Map)
- **Empty interfaces** w `command.tsx` + `textarea.tsx` (rozwiązane przez delete plików)
- **`require("tailwindcss-animate")`** → `import animate from "tailwindcss-animate"` (ESM compliance)
- **`framer-motion` ignorował `prefers-reduced-motion`** — global CSS `@media` zatrzymywał tylko CSS transitions, framer miał własny system. Naprawione przez `useMotionConfig` z `useReducedMotion()`

### Performance

- **Bundle main JS gzip**: 102 → **94 KB** (−8%)
- **CSS gzip**: 12 → **8 KB** (−33%)
- **Code splitting**: lazy routes (`Index`, `NotFound`) jako osobne chunki z `Suspense` fallback skeleton
- **`React.memo`** na TimelineEvent (eliminuje re-rendery listy historii)
- **`useFilteredEvents`** memoized filter + group (recompute tylko przy zmianach deps)

### Reliability

- **`ErrorBoundary`** w `App.tsx` — chroni przed white-screen-of-death, dev mode pokazuje stack trace
- **`Suspense` fallback** ([RouteFallback.tsx](src/components/RouteFallback.tsx)) — skeleton zgodny z layoutem docelowym (h-12 header + 5/7 grid)
