import { create } from "zustand";
import { persist } from "zustand/middleware";
import { leads, currentUser } from "@/data/fixtures";
import type { EditEntry, StatusCode, TimelineEvent, User } from "@/data/types";

type EventsByLead = Record<string, TimelineEvent[]>;

const initialEventsByLead: EventsByLead = leads.reduce<EventsByLead>((acc, l) => {
  acc[l.id] = l.events;
  return acc;
}, {});

interface LejkiState {
  leadId: string;
  eventsByLead: EventsByLead;
  owner: User;
  setLeadId: (id: string) => void;
  addEvent: (e: TimelineEvent) => void;
  updateEvent: (
    id: string,
    patch: Partial<Pick<TimelineEvent, "occurredAt">> & {
      comment?: string;
      reason?: string;
      text?: string;
    },
    edits: EditEntry[],
  ) => void;
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
            [s.leadId]: (s.eventsByLead[s.leadId] ?? []).map((e) => {
              if (e.id !== id) return e;
              const payload = { ...e.payload } as any;
              if (patch.comment !== undefined && "comment" in payload) payload.comment = patch.comment;
              if (patch.reason !== undefined && "reason" in payload) payload.reason = patch.reason;
              if (patch.text !== undefined && payload.kind === "note") payload.text = patch.text;
              return {
                ...e,
                occurredAt: patch.occurredAt ?? e.occurredAt,
                payload,
                edits: [...e.edits, ...newEdits],
              };
            }),
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
    },
  ),
);

export const useCurrentEvents = () =>
  useLejkiStore((s) => s.eventsByLead[s.leadId] ?? []);

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
