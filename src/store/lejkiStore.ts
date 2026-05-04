import { create } from "zustand";
import { persist } from "zustand/middleware";
import { leads, currentUser } from "@/data/fixtures";
import type { EditEntry, EventPayload, StatusCode, TimelineEvent, User } from "@/data/types";

type EventsByLead = Record<string, TimelineEvent[]>;

interface EventPatch {
  occurredAt?: string;
  comment?: string;
  reason?: string;
  text?: string;
}

const initialEventsByLead: EventsByLead = leads.reduce<EventsByLead>((acc, l) => {
  acc[l.id] = l.events;
  return acc;
}, {});

/**
 * Type-safe payload patcher for discriminated union TimelineEvent.payload.
 * Each event kind has different mutable fields — narrowing replaces the
 * previous `as any` cast.
 */
function applyPayloadPatch(payload: EventPayload, patch: EventPatch): EventPayload {
  switch (payload.kind) {
    case "status_change":
      return {
        ...payload,
        ...(patch.reason !== undefined && { reason: patch.reason }),
        ...(patch.comment !== undefined && { comment: patch.comment }),
      };
    case "score_change":
      return {
        ...payload,
        ...(patch.comment !== undefined && { comment: patch.comment }),
      };
    case "note":
      return {
        ...payload,
        ...(patch.text !== undefined && { text: patch.text }),
      };
    case "owner_change":
    case "system":
      return payload;
  }
}

interface LejkiState {
  leadId: string;
  eventsByLead: EventsByLead;
  owner: User;
  setLeadId: (id: string) => void;
  addEvent: (e: TimelineEvent) => void;
  updateEvent: (id: string, patch: EventPatch, edits: EditEntry[]) => void;
  replaceEvent: (id: string, prev: TimelineEvent) => void;
  removeEvent: (id: string) => void;
  setOwner: (u: User) => void;
}

export const useLejkiStore = create<LejkiState>()(
  persist(
    (set) => ({
      leadId: leads[0].id,
      eventsByLead: initialEventsByLead,
      owner: currentUser,
      setLeadId: (id) => set({ leadId: id }),
      addEvent: (e) =>
        set((s) => ({
          eventsByLead: { ...s.eventsByLead, [s.leadId]: [e, ...(s.eventsByLead[s.leadId] ?? [])] },
        })),
      removeEvent: (id) =>
        set((s) => ({
          eventsByLead: {
            ...s.eventsByLead,
            [s.leadId]: (s.eventsByLead[s.leadId] ?? []).filter((e) => e.id !== id),
          },
        })),
      replaceEvent: (id, prev) =>
        set((s) => ({
          eventsByLead: {
            ...s.eventsByLead,
            [s.leadId]: (s.eventsByLead[s.leadId] ?? []).map((e) => (e.id === id ? prev : e)),
          },
        })),
      updateEvent: (id, patch, newEdits) =>
        set((s) => ({
          eventsByLead: {
            ...s.eventsByLead,
            [s.leadId]: (s.eventsByLead[s.leadId] ?? []).map((e) =>
              e.id === id
                ? {
                    ...e,
                    occurredAt: patch.occurredAt ?? e.occurredAt,
                    payload: applyPayloadPatch(e.payload, patch),
                    edits: [...e.edits, ...newEdits],
                  }
                : e
            ),
          },
        })),
      setOwner: (u) => set({ owner: u }),
    }),
    {
      name: "lejki:state-v2",
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<LejkiState>;
        return {
          ...current,
          ...p,
          // Ensure all fixture leads exist (so newly added demo leads show up).
          eventsByLead: { ...initialEventsByLead, ...(p.eventsByLead ?? {}) },
        };
      },
    }
  )
);

export const useCurrentEvents = () => useLejkiStore((s) => s.eventsByLead[s.leadId] ?? []);

export const useCurrentLead = () => {
  const leadId = useLejkiStore((s) => s.leadId);
  return leads.find((l) => l.id === leadId) ?? leads[0];
};

export const deriveCurrentStatus = (events: TimelineEvent[]) => {
  const sorted = [...events]
    .filter((e) => e.payload.kind === "status_change")
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const last = sorted[0];
  if (!last || last.payload.kind !== "status_change") {
    return {
      code: "new" as StatusCode,
      reason: undefined as string | undefined,
      at: undefined as string | undefined,
      by: undefined as string | undefined,
    };
  }
  return {
    code: last.payload.to,
    reason: last.payload.reason,
    at: last.occurredAt,
    by: "system" in last.actor ? "System" : last.actor.name,
  };
};

export const deriveCurrentScore = (events: TimelineEvent[]) => {
  const sorted = [...events]
    .filter((e) => e.payload.kind === "score_change")
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  let score = 0;
  for (const e of sorted) if (e.payload.kind === "score_change") score = e.payload.to;
  const now = Date.now();
  const weekAgo = now - 7 * 86400_000;
  const delta = sorted
    .filter((e) => new Date(e.occurredAt).getTime() >= weekAgo)
    .reduce((sum, e) => sum + (e.payload.kind === "score_change" ? e.payload.delta : 0), 0);
  return { score, delta };
};
