import { create } from "zustand";
import { persist } from "zustand/middleware";
import { leads, currentUser } from "@/data/fixtures";
import type { EditEntry, EventPayload, StatusCode, TimelineEvent, User } from "@/data/types";
import { DAY_MS } from "@/lib/time";

type EventsByLead = Record<string, TimelineEvent[]>;

const PERSIST_KEY = "lejki:state-v2";
const SCORE_WINDOW_DAYS = 7;
const DEFAULT_STATUS: StatusCode = "new";

const initialEventsByLead: EventsByLead = Object.fromEntries(
  leads.map((l) => [l.id, l.events]),
);

interface EventPatch {
  occurredAt?: string;
  comment?: string;
  reason?: string;
  text?: string;
}

interface LejkiState {
  leadId: string;
  eventsByLead: EventsByLead;
  owner: User;
  setLeadId: (id: string) => void;
  addEvent: (event: TimelineEvent) => void;
  updateEvent: (id: string, patch: EventPatch, edits: EditEntry[]) => void;
  replaceEvent: (id: string, prev: TimelineEvent) => void;
  removeEvent: (id: string) => void;
  setOwner: (owner: User) => void;
}

const applyPatch = (payload: EventPayload, patch: EventPatch): EventPayload => {
  if (payload.kind === "note") {
    return patch.text !== undefined ? { ...payload, text: patch.text } : payload;
  }
  if (payload.kind === "status_change") {
    return {
      ...payload,
      ...(patch.reason !== undefined && { reason: patch.reason }),
      ...(patch.comment !== undefined && { comment: patch.comment }),
    };
  }
  if (payload.kind === "score_change") {
    return patch.comment !== undefined ? { ...payload, comment: patch.comment } : payload;
  }
  return payload;
};

const updateLeadEvents = (
  state: LejkiState,
  updater: (events: TimelineEvent[]) => TimelineEvent[],
): Partial<LejkiState> => ({
  eventsByLead: {
    ...state.eventsByLead,
    [state.leadId]: updater(state.eventsByLead[state.leadId] ?? []),
  },
});

export const useLejkiStore = create<LejkiState>()(
  persist(
    (set) => ({
      leadId: leads[0].id,
      eventsByLead: initialEventsByLead,
      owner: currentUser,

      setLeadId: (id) => set({ leadId: id }),
      setOwner: (owner) => set({ owner }),

      addEvent: (event) =>
        set((s) => updateLeadEvents(s, (events) => [event, ...events])),

      removeEvent: (id) =>
        set((s) => updateLeadEvents(s, (events) => events.filter((e) => e.id !== id))),

      replaceEvent: (id, prev) =>
        set((s) => updateLeadEvents(s, (events) => events.map((e) => (e.id === id ? prev : e)))),

      updateEvent: (id, patch, newEdits) =>
        set((s) =>
          updateLeadEvents(s, (events) =>
            events.map((e) =>
              e.id === id
                ? {
                    ...e,
                    occurredAt: patch.occurredAt ?? e.occurredAt,
                    payload: applyPatch(e.payload, patch),
                    edits: [...e.edits, ...newEdits],
                  }
                : e,
            ),
          ),
        ),
    }),
    {
      name: PERSIST_KEY,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<LejkiState>;
        return {
          ...current,
          ...p,
          // Preserve fixtures so newly added demo leads always appear after a release.
          eventsByLead: { ...initialEventsByLead, ...(p.eventsByLead ?? {}) },
        };
      },
    },
  ),
);

export const useCurrentEvents = () =>
  useLejkiStore((s) => s.eventsByLead[s.leadId] ?? []);

export const useCurrentLead = () => {
  const leadId = useLejkiStore((s) => s.leadId);
  return leads.find((l) => l.id === leadId) ?? leads[0];
};

const sortByOccurredAtAsc = (events: TimelineEvent[]) =>
  [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));

export interface CurrentStatus {
  code: StatusCode;
  reason?: string;
  at?: string;
  by?: string;
}

export const deriveCurrentStatus = (events: TimelineEvent[]): CurrentStatus => {
  const statusEvents = events.filter((e) => e.payload.kind === "status_change");
  const last = sortByOccurredAtAsc(statusEvents).at(-1);
  if (!last || last.payload.kind !== "status_change") {
    return { code: DEFAULT_STATUS };
  }
  return {
    code: last.payload.to,
    reason: last.payload.reason,
    at: last.occurredAt,
    by: "system" in last.actor ? "System" : last.actor.name,
  };
};

export interface CurrentScore {
  score: number;
  delta: number;
}

export const deriveCurrentScore = (events: TimelineEvent[]): CurrentScore => {
  const sorted = sortByOccurredAtAsc(
    events.filter((e) => e.payload.kind === "score_change"),
  );
  const last = sorted.at(-1);
  const score = last?.payload.kind === "score_change" ? last.payload.to : 0;
  const since = Date.now() - SCORE_WINDOW_DAYS * DAY_MS;
  const delta = sorted
    .filter((e) => new Date(e.occurredAt).getTime() >= since)
    .reduce((sum, e) => sum + (e.payload.kind === "score_change" ? e.payload.delta : 0), 0);
  return { score, delta };
};
