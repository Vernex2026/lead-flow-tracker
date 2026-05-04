import type { TimelineEvent, User } from "./types";

export const currentUser: User = { id: "u_anna", name: "Anna Kowal", email: "anna.kowal@firma.pl" };
export const userJan: User = { id: "u_jan", name: "Jan Kowalski", email: "jan@firma.pl" };

export interface LeadFixture {
  id: string;
  name: string;
  email: string;
  funnel: { id: string; name: string };
  owner: User;
  events: TimelineEvent[];
}

const seleniumEvents: TimelineEvent[] = [
  {
    id: "e1",
    type: "status_change",
    occurredAt: "2026-05-03T14:32:00",
    createdAt: "2026-05-03T14:32:00",
    actor: currentUser,
    payload: {
      kind: "status_change",
      from: "new",
      to: "qualified",
      reason: "Zainteresowanie ofertą premium",
      comment: "Po rozmowie z handlowcem zdecydowała się na demo.",
    },
    edits: [],
  },
  {
    id: "e2",
    type: "score_change",
    occurredAt: "2026-05-03T09:15:00",
    createdAt: "2026-05-03T09:15:00",
    actor: { system: true },
    payload: {
      kind: "score_change",
      delta: 15,
      from: 70,
      to: 85,
      comment: "Kliknął link w mailu kampanii Q2",
    },
    edits: [],
  },
  {
    id: "e3",
    type: "score_change",
    occurredAt: "2026-05-02T16:48:00",
    createdAt: "2026-05-02T16:48:00",
    actor: userJan,
    payload: { kind: "score_change", delta: 5, from: 65, to: 70 },
    edits: [
      {
        editedAt: "2026-05-03T10:00:00",
        editedBy: currentUser,
        field: "occurredAt",
        previousValue: "2026-05-04T16:48:00",
        newValue: "2026-05-02T16:48:00",
      },
    ],
  },
  {
    id: "e4",
    type: "note",
    occurredAt: "2026-05-02T11:00:00",
    createdAt: "2026-05-02T11:00:00",
    actor: userJan,
    payload: { kind: "note", text: "Klient prosi o materiały po polsku przed kolejnym callem." },
    edits: [],
  },
  {
    id: "e5",
    type: "score_change",
    occurredAt: "2026-05-01T10:20:00",
    createdAt: "2026-05-01T10:20:00",
    actor: { system: true },
    payload: {
      kind: "score_change",
      delta: 10,
      from: 55,
      to: 65,
      comment: "Otworzył mail kampanii Q2",
    },
    edits: [],
  },
  {
    id: "e6",
    type: "owner_change",
    occurredAt: "2026-04-30T08:00:00",
    createdAt: "2026-04-30T08:00:00",
    actor: currentUser,
    payload: { kind: "owner_change", from: userJan, to: currentUser },
    edits: [],
  },
  {
    id: "e7",
    type: "score_change",
    occurredAt: "2026-04-29T15:30:00",
    createdAt: "2026-04-29T15:30:00",
    actor: { system: true },
    payload: {
      kind: "score_change",
      delta: -5,
      from: 60,
      to: 55,
      comment: "Brak aktywności (7 dni)",
    },
    edits: [],
  },
  {
    id: "e8",
    type: "score_change",
    occurredAt: "2026-04-28T12:00:00",
    createdAt: "2026-04-28T12:00:00",
    actor: userJan,
    payload: { kind: "score_change", delta: 20, from: 40, to: 60, comment: "Demo zaplanowane" },
    edits: [],
  },
  {
    id: "e9",
    type: "status_change",
    occurredAt: "2026-04-25T09:00:00",
    createdAt: "2026-04-25T09:00:00",
    actor: userJan,
    payload: {
      kind: "status_change",
      from: "new",
      to: "new",
      reason: "Zaparkowane",
      comment: "Czekamy na decyzję.",
    },
    edits: [],
  },
  {
    id: "e10",
    type: "score_change",
    occurredAt: "2026-04-24T14:00:00",
    createdAt: "2026-04-24T14:00:00",
    actor: { system: true },
    payload: { kind: "score_change", delta: 5, from: 35, to: 40 },
    edits: [],
  },
  {
    id: "e11",
    type: "score_change",
    occurredAt: "2026-04-23T16:00:00",
    createdAt: "2026-04-23T16:00:00",
    actor: { system: true },
    payload: {
      kind: "score_change",
      delta: 10,
      from: 25,
      to: 35,
      comment: "Wypełnił formularz kontaktowy",
    },
    edits: [],
  },
  {
    id: "e12",
    type: "system",
    occurredAt: "2026-04-23T15:29:00",
    createdAt: "2026-04-23T15:29:00",
    actor: { system: true },
    payload: { kind: "system", text: "Kontakt utworzony z formularza „Demo request”." },
    edits: [],
  },
];

export const leads: LeadFixture[] = [
  {
    id: "lead_01",
    name: "Selenium01",
    email: "kontakt@selenium01.pl",
    funnel: { id: "fn_general", name: "Lejek ogólny" },
    owner: currentUser,
    events: seleniumEvents,
  },
  {
    id: "lead_02",
    name: "Nowy kontakt",
    email: "nowy.kontakt@example.pl",
    funnel: { id: "fn_general", name: "Lejek ogólny" },
    owner: currentUser,
    events: [],
  },
];
