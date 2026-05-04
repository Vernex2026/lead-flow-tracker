import type { ReactNode } from "react";
import { DocsPanel } from "./DocsPanel";
import { LejkiSection } from "./LejkiSection";
import { SECTION_LABEL } from "./sections";
import type { EditingCard } from "./CurrentStateColumn";

interface SectionRouterProps {
  active: string;
  editingCard: EditingCard;
  setEditingCard: (c: EditingCard) => void;
  onSetStatus: () => void;
  onAddScore: () => void;
}

/**
 * Wybiera komponent do wyrenderowania na podstawie aktywnej sekcji.
 * Skalowalne: dodawanie nowej sekcji = dopisanie case'u.
 * Sekcje bez własnego komponentu pokazują uniwersalny placeholder.
 */
export function SectionRouter({
  active,
  editingCard,
  setEditingCard,
  onSetStatus,
  onAddScore,
}: SectionRouterProps): ReactNode {
  if (active === "lejki") {
    return (
      <LejkiSection
        editingCard={editingCard}
        setEditingCard={setEditingCard}
        onSetStatus={onSetStatus}
        onAddScore={onAddScore}
      />
    );
  }

  return (
    <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-8">
      {active === "docs" ? <DocsPanel /> : <SectionPlaceholder section={active} />}
    </main>
  );
}

function SectionPlaceholder({ section }: { section: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-border bg-surface p-12 text-center">
      <h1 className="text-[22px] font-semibold tracking-tight text-ink-1">
        {SECTION_LABEL[section] ?? section}
      </h1>
      <p className="mt-2 text-sm text-ink-3">Ta sekcja nie jest częścią obecnego prototypu.</p>
    </div>
  );
}
