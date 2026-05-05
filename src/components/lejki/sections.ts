/**
 * Centralna mapa sekcji aplikacji widocznych w sidebarze + breadcrumbs.
 *
 * Aby dodać nową sekcję:
 * 1. Rozszerz `SectionKey` o nowy literal.
 * 2. Dodaj wpis tutaj w `SECTION_LABEL` (TS wymusi exhaustive map).
 * 3. Dodaj ikonę i grupę w `ContactSidebar.tsx` (GROUPS).
 * 4. Dodaj rendering w `SectionRouter.tsx` jeśli ma własny komponent;
 *    inaczej zostanie wyświetlony placeholder "Sekcja w przygotowaniu".
 */
export type SectionKey =
  | "data"
  | "consents"
  | "tags"
  | "lejki"
  | "messages"
  | "sessions"
  | "forms"
  | "products"
  | "purchases"
  | "events"
  | "scenarios"
  | "docs";

export const SECTION_LABEL: Record<SectionKey, string> = {
  data: "Dane klienta",
  consents: "Zgody",
  tags: "Tagi",
  lejki: "Lejki",
  messages: "Wiadomości",
  sessions: "Sesje WWW",
  forms: "Formularze",
  products: "Produkty",
  purchases: "Zakupy",
  events: "Zdarzenia własne",
  scenarios: "Scenariusze",
  docs: "Dokumentacja",
};

const SECTION_KEYS = Object.keys(SECTION_LABEL) as SectionKey[];

export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as string[]).includes(value);
}

export function getSectionLabel(key: string, fallback = "Lejki"): string {
  return isSectionKey(key) ? SECTION_LABEL[key] : fallback;
}
