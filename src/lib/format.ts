import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export const fmtRelative = (iso: string) =>
  formatDistanceToNowStrict(parseISO(iso), { addSuffix: true, locale: pl });

export const fmtTime = (iso: string) => format(parseISO(iso), "HH:mm");
export const fmtDate = (iso: string) => format(parseISO(iso), "d LLL yyyy", { locale: pl });
export const fmtDateTime = (iso: string) =>
  format(parseISO(iso), "d LLL yyyy, HH:mm", { locale: pl });
export const dayKey = (iso: string) => format(parseISO(iso), "yyyy-MM-dd");

export const dayLabel = (iso: string) => {
  const d = parseISO(iso);
  if (isToday(d)) return "Dzisiaj";
  if (isYesterday(d)) return "Wczoraj";
  return format(d, "EEEE, d LLLL yyyy", { locale: pl });
};
