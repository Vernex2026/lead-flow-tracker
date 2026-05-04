/**
 * Centralna mapa sekcji aplikacji widocznych w sidebarze + breadcrumbs.
 *
 * Aby dodać nową sekcję:
 * 1. Dodaj wpis tutaj (key: label).
 * 2. Dodaj ikonę i grupę w `ContactSidebar.tsx` (GROUPS).
 * 3. Dodaj rendering w `SectionRouter.tsx` jeśli ma własny komponent;
 *    inaczej zostanie wyświetlony placeholder "Sekcja w przygotowaniu".
 */
export const SECTION_LABEL: Record<string, string> = {
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
