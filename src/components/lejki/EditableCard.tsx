import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMotionConfig } from "@/hooks/useMotionConfig";

interface EditableCardProps {
  /** Eyebrow tytuł karty (wielkimi literami w eyebrow style) */
  title: string;
  /** True gdy karta jest w trybie edycji */
  editing: boolean;
  /** Wywoływane gdy user klika ikonę edycji w headerze */
  onEditStart: () => void;
  /** Etykieta przycisku edycji (np. "Edytuj", "Dodaj punkty", "Dodaj") */
  editLabel: string;
  /** Ikona w przycisku edycji (Pencil, Plus...) */
  editIcon: LucideIcon;
  /** Krótka etykieta na mobile (sm:hidden), domyślnie pierwsze słowo z editLabel */
  editLabelShort?: string;
  /** Widok w trybie tylko-do-odczytu */
  view: ReactNode;
  /** Widok formularza edycji */
  edit: ReactNode;
}

/**
 * Reużywalny pattern dla kart które mają tryb view ↔ edit (StatusCard,
 * ScoringCard). Obsługuje:
 * - eyebrow header z przyciskiem Edytuj
 * - AnimatePresence mode="wait" dla płynnego switch między widokami
 * - prefers-reduced-motion (przez useMotionConfig)
 *
 * Karty consumer-side podają tylko {view, edit} jako ReactNode + handlers.
 */
export function EditableCard({
  title,
  editing,
  onEditStart,
  editLabel,
  editIcon: Icon,
  editLabelShort,
  view,
  edit,
}: EditableCardProps) {
  const { base } = useMotionConfig();
  const shortLabel = editLabelShort ?? editLabel.split(" ")[0];

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-xs">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">
          {title}
        </h3>
        {!editing && (
          <Button
            variant="ghost"
            size="sm"
            className="-mr-1.5 h-7 gap-1 px-2 text-ink-2"
            onClick={onEditStart}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{editLabel}</span>
            <span className="sm:hidden">{shortLabel}</span>
          </Button>
        )}
      </header>

      <AnimatePresence mode="wait" initial={false}>
        {!editing ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={base}
          >
            {view}
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={base}
          >
            {edit}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
