# YouLead — CRM Marketing Automation

Prototyp interfejsu CRM dla marketing automation. Skupiony na zakładce **Lejki** — zarządzanie statusem, scoringiem i pełną historią aktywności leada z możliwością edycji wpisów oraz cofania zmian.

## Stack

- **React 18** + **TypeScript** + **Vite** (SWC)
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Zustand** (state) · **React Query** (async, ready-to-wire) · **React Router 6**
- **Framer Motion** (transitions) · **Sonner** (toasts) · **Lucide** (icons)
- **Vitest** + **Testing Library** (unit/component)

## Funkcje (zakładka Lejki)

- **Dwukolumnowy widok 5/7** — Stan aktualny | Historia aktywności (desktop)
- **Tabs na mobile/tablet** (<1024px) — przełączanie zamiast scrollowania
- **Status leada** z 5-stopniowym workflow (`new → qualified → opportunity → won/lost`) z polem powodu i komentarzem
- **Scoring** z trendami i historią zmian
- **Timeline** z dziennym grupowaniem, sticky day headers, hover edit
- **Filtry historii**: typ wpisu, query, sortowanie, period (7d/30d/90d), status, kierunek scoringu
- **Edycja historycznych wpisów** z audit trailem (każda zmiana zapisana w `event.edits`)
- **Optimistic updates** z toast undo (5s na cofnięcie każdej akcji)
- **Empty state** z konkretnymi CTA
- **Mobile drawer** z backdrop blur i ESC handler
- **Dark mode** (toggle w headerze)
- **Pełna a11y**: `aria-label`, `focus-visible`, `prefers-reduced-motion`, semantic HTML, `<time dateTime>`

## Struktura

```
src/
  components/
    lejki/        # Domain components: panel, columns, cards, timeline
    primitives/   # Custom: ScoreBar, Sparkline, StatusChip, RelativeTime, etc.
    ui/           # shadcn primitives
  data/           # Fixtures, types, constants
  hooks/          # Custom hooks
  lib/            # Utilities, formatters
  pages/          # Routes (Index, NotFound)
  store/          # Zustand store
  test/           # Test setup
```

## Design system

Tokens w [`src/index.css`](src/index.css). Mapowanie do Tailwind w [`tailwind.config.ts`](tailwind.config.ts).

- **Surface ladder**: `bg → surface → surface-2 → surface-3`
- **Ink hierarchy**: 4 stopnie tekstu (`ink-1` do `ink-4`)
- **Status semantic colors** z `*-fg` foreground variants
- **Multi-layer shadows** (`shadow-xs/sm/DEFAULT/lg`)
- **Type scale**: Inter, tabular-nums utility (`.tnum`)
- **Motion**: 240ms ease-out dla wejść, 180ms shake dla błędów, `prefers-reduced-motion` respected

## Setup

```bash
# Instalacja (Bun preferowany — projekt ma bun.lockb)
bun install
# lub: npm install

# Skopiuj env template (opcjonalnie — patrz sekcja "Hasło")
cp .env.example .env.local

# Dev server (port 5173)
bun dev

# Production build
bun run build

# Preview production build
bun run preview

# Testy
bun test           # one-shot
bun test:watch     # watch mode

# Lint
bun lint
```

## Hasło / kontrola dostępu

Aplikacja ma frontend gate: jeśli zmienna `VITE_APP_PASSWORD_HASH` (SHA-256 hex) jest ustawiona, użytkownik musi wpisać hasło zanim zobaczy UI. Sesja trzyma się 24h w `localStorage`.

**Wygeneruj własny hash:**

```bash
printf 'TwojeHaslo' | shasum -a 256 | awk '{print $1}'
```

**Lokalnie:** wklej do `.env.local`:

```
VITE_APP_PASSWORD_HASH=<wygenerowany hash>
```

**Vercel (produkcja):** Project → Settings → Environment Variables → dodaj `VITE_APP_PASSWORD_HASH` (Production + Preview). Następny deploy ustawi gate.

**Wyłącz gate:** zostaw zmienną pustą lub usuń ją.

> ⚠️ To NIE jest pełna ochrona — hash jest w bundlu front-endowym i ktoś z devtools może obejść gate. Zabezpiecza przed przypadkowymi gośćmi i indeksowaniem przez Google. Dla realnej ochrony użyj Vercel Pro Password Protection lub Cloudflare Access.

## Deploy

Projekt jest standardowym Vite SPA — działa wszędzie gdzie host'uje się static files.

**Vercel** (rekomendowane):

```bash
vercel deploy --prod
```

**Netlify / Cloudflare Pages:**

- Build command: `vite build`
- Output directory: `dist`

## Roadmap

- [ ] Backend (Supabase) — obecnie wszystko w pamięci (Zustand + fixtures)
- [ ] Auth (Supabase Auth lub Clerk)
- [ ] Pozostałe sekcje sidebara: Dane, Zgody, Tagi, Wiadomości, Sesje WWW, Formularze, Produkty, Zakupy, Zdarzenia, Scenariusze
- [ ] ⌘K command palette (cmdk już w deps)
- [ ] Keyboard shortcuts (J/K nawigacja, S/N akcje)
- [ ] Globalny search po leadach (zamiast dropdown w headerze)
- [ ] Eksport historii do CSV/PDF
- [ ] Bulk actions
- [ ] Webhooks / API dla integracji

## Licencja

Prywatne. Wszelkie prawa zastrzeżone.
