export type StatusCode = "new" | "qualified" | "opportunity" | "won" | "lost";

export interface User {
  id: string;
  name: string;
  email?: string;
}

export type Actor = User | { system: true };

export interface EditEntry {
  editedAt: string;
  editedBy: User;
  field: "occurredAt" | "comment" | "reason" | "text";
  previousValue: unknown;
  newValue: unknown;
}

export type EventPayload =
  | { kind: "status_change"; from: StatusCode; to: StatusCode; reason?: string; comment?: string }
  | { kind: "score_change"; delta: number; from: number; to: number; comment?: string }
  | { kind: "owner_change"; from: User; to: User }
  | { kind: "note"; text: string }
  | { kind: "system"; text: string };

export type EventType = EventPayload["kind"];

export interface TimelineEvent {
  id: string;
  type: EventType;
  occurredAt: string;
  createdAt: string;
  actor: Actor;
  payload: EventPayload;
  edits: EditEntry[];
}

export const STATUS_LABEL: Record<StatusCode, string> = {
  new: "Nowy",
  qualified: "Kwalifikowany",
  opportunity: "Możliwość sprzedaży",
  won: "Wygrany",
  lost: "Utracony",
};

export const STATUS_REASONS: Record<StatusCode, string[]> = {
  new: ["Z formularza", "Import"],
  qualified: ["Zainteresowanie ofertą premium", "Pozytywna rozmowa", "Zapis na demo"],
  opportunity: ["Wysłana oferta", "Negocjacje cenowe"],
  won: ["Podpisana umowa", "Płatność otrzymana"],
  lost: ["Brak budżetu", "Wybrał konkurencję", "Brak kontaktu"],
};
