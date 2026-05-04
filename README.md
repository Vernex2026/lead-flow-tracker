<div align="center">

# YouLead — CRM Marketing Automation

**Prototyp interfejsu CRM** skupiony na zakładce _Lejki_ — zarządzanie statusem leada, scoringiem i pełną historią aktywności z audit trailem oraz optimistic updates.

[![CI](https://github.com/Vernex2026/lead-flow-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/Vernex2026/lead-flow-tracker/actions/workflows/ci.yml)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-Private-red.svg)

</div>

---

## Spis treści

- [Funkcjonalności](#funkcjonalno%C5%9Bci)
- [Tech stack](#tech-stack)
- [Architektura](#architektura)
- [Quick start](#quick-start)
- [Skrypty](#skrypty)
- [Struktura projektu](#struktura-projektu)
- [Design system](#design-system)
- [Quality gates](#quality-gates)
- [Konfiguracja hasła](#konfiguracja-has%C5%82a)
- [Deploy](#deploy)
- [Roadmap](#roadmap)

---

## Funkcjonalności

- **Dwukolumnowy widok 5/7** na desktopie · **tabs** na <1024px (Stan aktualny | Historia)
- **Status leada** w 5-stopniowym workflow: `new → qualified → opportunity → won | lost` z polem powodu i komentarzem
- **Scoring** z animowanym count-up, trendem 7-dniowym i sparkline historii
- **Timeline aktywności** z dziennym grupowaniem, sticky day headers, hover-edit każdego wpisu
- **Filtry historii**: typ wpisu, query (case-insensitive), sortowanie, period (7/30/90 dni), kierunek scoringu
- **Edycja historycznych wpisów** z pełnym audit trailem — każda zmiana w `event.edits[]` z autorem, timestampem, polem i poprzednią wartością
- **Optimistic updates** z toast undo (5s) dla każdej akcji (zmiana statusu, dodanie scoringu, edycja eventu)
- **Mobile drawer** z backdrop blur, ESC handler, focus trap (`role="dialog" aria-modal`)
- **Dark mode** przez `next-themes` (system preference + persistence + zero FOUC)
- **Frontend password gate** z SHA-256 + 24h sesja w localStorage
- **A11y**: ARIA labels wszędzie, `focus-visible`, `prefers-reduced-motion` respected (CSS + framer-motion), semantic HTML, WCAG AA contrast

## Tech stack

| Warstwa           | Biblioteki                                                                       |
| ----------------- | -------------------------------------------------------------------------------- |
| **Framework**     | React 18, TypeScript 5 (strict), Vite 5 (SWC)                                    |
| **State**         | Zustand (z `persist` middleware)                                                 |
| **Routing**       | React Router 6                                                                   |
| **UI primitives** | shadcn/ui (Radix) — dialog, popover, select, tabs, tooltip, dropdown, hover-card |
| **Styling**       | Tailwind CSS 3, CSS custom properties (HSL tokens), `cn()` utility               |
| **Animation**     | Framer Motion (z `useReducedMotion`)                                             |
| **Notifications** | Sonner (z action undo)                                                           |
| **Forms**         | Native `<form>` + Zustand actions (no react-hook-form needed)                    |
| **Theming**       | next-themes (system / light / dark)                                              |
| **Icons**         | Lucide React (per-icon imports, tree-shaken)                                     |
| **Date/time**     | date-fns + `pl` locale                                                           |
| **Testing**       | Vitest 3 + Testing Library + jsdom                                               |
| **Linting**       | ESLint 9 (typescript-eslint, react-hooks, react-refresh)                         |
| **Formatting**    | Prettier 3                                                                       |
| **Git hooks**     | Husky + lint-staged (pre-commit lint + format)                                   |
| **CI**            | GitHub Actions (lint + type-check + format check + test + build)                 |

## Architektura

```
┌─────────────────────────────────────────────────────────────┐
│  ErrorBoundary                                              │
│  └── ThemeProvider (next-themes)                            │
│      └── PasswordGate (SHA-256 + localStorage session)      │
│          └── TooltipProvider                                │
│              └── Toaster (shadcn) + Sonner                  │
│                  └── BrowserRouter                          │
│                      └── Suspense (RouteFallback skeleton)  │
│                          └── Routes (lazy-loaded)           │
│                              └── LejkiPanel (root composer) │
│                                  ├── ContactSidebar (desktop)│
│                                  ├── MobileDrawer (<768px)   │
│                                  ├── AppHeader               │
│                                  └── SectionRouter           │
│                                      ├── LejkiSection        │
│                                      │   ├── CurrentStateColumn│
│                                      │   │   ├── StatusCard ◄┐
│                                      │   │   ├── ScoringCard◄┤ EditableCard pattern
│                                      │   │   └── OwnerCard   │
│                                      │   └── HistoryColumn   │
│                                      │       ├── HistoryFilters│
│                                      │       └── TimelineEvent (memo'd)│
│                                      ├── DocsPanel           │
│                                      └── SectionPlaceholder  │
└─────────────────────────────────────────────────────────────┘

Data flow: useLejkiStore (Zustand) ↔ deriveCurrentStatus / deriveCurrentScore (pure)
           ↕
           Components subscribe granularly (useCurrentEvents, useCurrentLead)
```

**Pure logic w izolacji:**

- `src/store/lejkiStore.ts` — Zustand store + actions (`addEvent`, `updateEvent`, `removeEvent`, `replaceEvent`) + pure derives
- `src/hooks/useFilteredEvents.ts` — filter + group-by-day logic (testowalny w izolacji)
- `src/hooks/useMotionConfig.ts` — wrapper na framer-motion respektujący `prefers-reduced-motion`
- `src/lib/format.ts` — date formatting z polskim locale
- `src/components/lejki/EditableCard.tsx` — compound component dla view↔edit pattern

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. (Opcjonalnie) skonfiguruj hasło — patrz "Konfiguracja hasła"
cp .env.example .env.local

# 3. Run dev server (http://localhost:8080)
npm run dev

# 4. (Opcjonalnie) odpal testy w trybie watch
npm test
```

## Skrypty

| Skrypt                  | Opis                                               |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Vite dev server z HMR (port 8080)                  |
| `npm run build`         | Production build (TypeScript + Vite + minify)      |
| `npm run preview`       | Preview production build (port 4173)               |
| `npm run lint`          | ESLint check (CI gate)                             |
| `npm run lint:fix`      | ESLint z auto-fix                                  |
| `npm run type-check`    | `tsc --noEmit` (CI gate)                           |
| `npm run format`        | Prettier write na całym repo                       |
| `npm run format:check`  | Prettier verify (CI gate)                          |
| `npm test`              | Vitest watch mode                                  |
| `npm run test:ci`       | Vitest single run (CI gate)                        |
| `npm run test:coverage` | Vitest + coverage report (`./coverage/index.html`) |

## Struktura projektu

```
lead-flow-tracker/
├── .github/
│   ├── workflows/ci.yml             # Lint + typecheck + format + test + build
│   ├── pull_request_template.md     # PR review checklist
│   └── dependabot.yml               # Auto deps updates (weekly)
├── .husky/pre-commit                # lint-staged on commit
├── public/
│   ├── favicon.ico
│   ├── manifest.json                # PWA-ready
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── lejki/                   # Domain — Lejki tab
│   │   │   ├── timeline/
│   │   │   │   └── EventEditPopover.tsx
│   │   │   ├── AppHeader.tsx        # Topbar (breadcrumbs, lead picker, theme)
│   │   │   ├── ContactSidebar.tsx   # Left nav z grupami sekcji
│   │   │   ├── CurrentStateColumn.tsx
│   │   │   ├── DocsPanel.tsx
│   │   │   ├── EditableCard.tsx     # Compound view↔edit pattern
│   │   │   ├── HistoryColumn.tsx
│   │   │   ├── HistoryFilters.tsx
│   │   │   ├── LejkiPanel.tsx       # Root composer + cross-section state
│   │   │   ├── LejkiSection.tsx     # Lejki tab content (5/7 grid lub tabs)
│   │   │   ├── MobileDrawer.tsx
│   │   │   ├── OwnerCard.tsx
│   │   │   ├── ScoringCard.tsx
│   │   │   ├── SectionRouter.tsx    # Wybiera komponent po active section
│   │   │   ├── StatusCard.tsx
│   │   │   ├── TimelineEvent.tsx    # React.memo — re-render only on event change
│   │   │   └── sections.ts
│   │   ├── primitives/              # Custom widgets (Avatar, ScoreBar, Sparkline...)
│   │   ├── ui/                      # shadcn (button, dialog, popover, select...)
│   │   ├── ErrorBoundary.tsx
│   │   ├── PasswordGate.tsx         # SHA-256 frontend gate + tests
│   │   └── RouteFallback.tsx
│   ├── data/
│   │   ├── fixtures.ts              # Mock leads + events
│   │   └── types.ts                 # Discriminated union TimelineEvent
│   ├── hooks/
│   │   ├── useFilteredEvents.ts     # Filter + group-by-day logic + tests
│   │   ├── useMotionConfig.ts       # Framer-motion + prefers-reduced-motion
│   │   ├── use-media-query.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── format.ts                # Date formatting (pl locale) + tests
│   │   ├── time.ts                  # DAY_MS / HOUR_MS constants
│   │   └── utils.ts                 # cn() classname helper
│   ├── pages/
│   │   ├── Index.tsx                # Lazy-loaded
│   │   └── NotFound.tsx
│   ├── store/
│   │   └── lejkiStore.ts            # Zustand + persist + pure derives + tests
│   ├── test/
│   │   └── setup.ts                 # Test utilities + matchers
│   ├── App.tsx
│   ├── index.css                    # Design tokens + dark mode + base
│   └── main.tsx
├── .editorconfig
├── .env.example
├── .prettierrc
├── eslint.config.js
├── tailwind.config.ts               # Token mapping z CSS vars
├── tsconfig.app.json                # strict: true
├── vercel.json                      # SPA rewrites + cache headers + CSP
├── vite.config.ts
└── vitest.config.ts                 # 60% coverage thresholds
```

## Design system

Wszystkie tokens w [`src/index.css`](src/index.css), zmapowane do Tailwind w [`tailwind.config.ts`](tailwind.config.ts).

| Aspekt          | System                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Colors**      | HSL CSS vars w `:root` + override w `.dark` — surface ladder, ink hierarchy 4 stopnie, status semantic colors z `*-fg` foreground variants |
| **Surfaces**    | `bg → surface → surface-2 → surface-3` (4 levels)                                                                                          |
| **Text**        | `ink-1` (primary) → `ink-2` (secondary) → `ink-3` (tertiary) → `ink-4` (faint) — wszystko z WCAG AA contrast                               |
| **Typography**  | Inter, tabular-nums utility (`.tnum`), letter-spacing tight na headers                                                                     |
| **Shadows**     | Multi-layer: `shadow-xs` (0.04 opacity) → `shadow-sm` → `shadow` → `shadow-lg`                                                             |
| **Radius**      | 10px (default), 14px (lg) — z CSS vars                                                                                                     |
| **Motion**      | 180/240/320ms ease-out `[0.16, 1, 0.3, 1]`, `prefers-reduced-motion` respected przez [`useMotionConfig`](src/hooks/useMotionConfig.ts)     |
| **Breakpoints** | Tailwind defaults: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1440                                                                    |

## Quality gates

Każdy PR musi przejść (CI: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)):

- ✅ **ESLint** — `@typescript-eslint`, `react-hooks/exhaustive-deps`, `no-explicit-any`, `no-unused-vars` (z `^_` escape), `no-console` (warn)
- ✅ **TypeScript strict** — `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- ✅ **Prettier** — `semi: true`, `singleQuote: false`, `printWidth: 100`, LF
- ✅ **Vitest** — 28 unit tests (store derives, format utils, password gate, useFilteredEvents hook), 60% coverage thresholds
- ✅ **Vite build** — production bundle bez błędów, code-split na lazy routes

**Pre-commit hook** ([`.husky/pre-commit`](.husky/pre-commit)) odpala lint-staged → eslint --fix + prettier --write na changed files. Niemożliwe scommitować nieformatowanego kodu.

**Bundle size** (production, gzipped):

```
dist/index.html              0.88 KB
dist/assets/index.css        8.06 KB
dist/assets/index.js        94.57 KB  ◄── main bundle (vendor + framework)
dist/assets/Index.js       108.61 KB  ◄── lazy-loaded /pages/Index
dist/assets/NotFound.js      0.38 KB  ◄── lazy-loaded /pages/NotFound
```

## Konfiguracja hasła

Aplikacja ma **frontend password gate** — UI jest rozmyty (blur + dim) dopóki użytkownik nie wpisze prawidłowego hasła. Sesja trzyma się 24h w `localStorage`.

**Domyślnie:** wbudowany hash dla hasła `Vernex123!@#` działa out-of-the-box (lokalne dev, Lovable preview, Vercel bez env var). Możesz nadpisać przez env var.

**Jak ustawić własne hasło:**

```bash
# Wygeneruj hash
printf 'TwojeHaslo' | shasum -a 256 | awk '{print $1}'
# → 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8

# Lokalnie: dodaj do .env.local
echo "VITE_APP_PASSWORD_HASH=<hash>" >> .env.local

# Vercel: Project → Settings → Environment Variables → VITE_APP_PASSWORD_HASH
# (Production + Preview, redeploy aby aktywować)
```

> ⚠️ **To NIE jest pełna ochrona** — hash jest w bundlu front-endowym i ktoś z devtools może obejść gate. Zabezpiecza przed przypadkowymi gośćmi i indeksowaniem przez Google. Dla realnej ochrony użyj **Vercel Pro Password Protection** lub **Cloudflare Access**.

## Deploy

[`vercel.json`](vercel.json) zawiera kompletną konfigurację: SPA rewrites, cache-control immutable na `/assets/*` (1 rok), security headers (X-Frame-Options DENY, Permissions-Policy, X-Content-Type-Options).

```bash
vercel deploy --prod
```

Alternatywnie (Netlify / Cloudflare Pages):

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 18.17+
- **SPA rewrite:** `/* → /index.html`

## Roadmap

- [ ] **Backend** (Supabase) — obecnie Zustand + fixtures w pamięci
- [ ] **Auth** (Supabase Auth lub Clerk)
- [ ] Pozostałe sekcje sidebara: Wiadomości, Sesje WWW, Formularze, Produkty, Zakupy
- [ ] **⌘K command palette** + keyboard shortcuts (J/K nav, S/N akcje)
- [ ] **Globalny search** po leadach (zamiast dropdown w headerze)
- [ ] Eksport historii do CSV/PDF
- [ ] Bulk actions na liście leadów
- [ ] Webhooks / API dla integracji
- [ ] Storybook dla komponentów (primitives + EditableCard variants)
- [ ] E2E testy (Playwright) dla golden path: status edit + score + history filter

## Licencja

Prywatne. Wszelkie prawa zastrzeżone. Patrz [LICENSE](LICENSE).
