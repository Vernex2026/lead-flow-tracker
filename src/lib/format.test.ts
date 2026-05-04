import { describe, expect, it, vi } from "vitest";
import { dayKey, dayLabel, fmtDate, fmtDateTime, fmtTime } from "./format";

describe("format utilities", () => {
  describe("fmtTime", () => {
    it("formatuje ISO do HH:mm", () => {
      expect(fmtTime("2026-05-04T14:32:00Z")).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe("fmtDate", () => {
    it("formatuje datę po polsku ('4 maj 2026')", () => {
      const result = fmtDate("2026-05-04T10:00:00Z");
      expect(result).toMatch(/4 maj 2026/);
    });
  });

  describe("fmtDateTime", () => {
    it("zawiera datę i czas po polsku", () => {
      const result = fmtDateTime("2026-05-04T14:32:00Z");
      expect(result).toMatch(/4 maj 2026/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe("dayKey", () => {
    it("zwraca yyyy-MM-dd dla grupowania po dniu", () => {
      expect(dayKey("2026-05-04T14:32:00Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("ten sam dzień, różny czas → ten sam klucz", () => {
      const morning = dayKey("2026-05-04T08:00:00Z");
      const evening = dayKey("2026-05-04T20:00:00Z");
      expect(morning).toBe(evening);
    });
  });

  describe("dayLabel", () => {
    it("zwraca 'Dzisiaj' dla bieżącego dnia", () => {
      const today = new Date().toISOString();
      expect(dayLabel(today)).toBe("Dzisiaj");
    });

    it("zwraca 'Wczoraj' dla wczoraj", () => {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString();
      expect(dayLabel(yesterday)).toBe("Wczoraj");
    });

    it("zwraca pełny polski format dla starszych dat", () => {
      // Stała data — nie zależna od „today" testowego
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-15T12:00:00Z"));
      const old = "2026-05-01T10:00:00Z";
      const label = dayLabel(old);
      expect(label).toMatch(/(maj|maja)/i);
      expect(label).toMatch(/2026/);
      vi.useRealTimers();
    });
  });
});
