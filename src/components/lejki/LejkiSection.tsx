import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurrentStateColumn, type EditingCard } from "./CurrentStateColumn";
import { HistoryColumn } from "./HistoryColumn";
import { useCurrentLead } from "@/store/lejkiStore";

interface LejkiSectionProps {
  editingCard: EditingCard;
  setEditingCard: (c: EditingCard) => void;
  onSetStatus: () => void;
  onAddScore: () => void;
}

/**
 * Główna zawartość zakładki "Lejki":
 * - h1 z funnel name + opis
 * - Desktop ≥1024px: 2-col grid (5/7) ze stanem aktualnym | historią
 * - Tablet/mobile <1024px: tabs ("Stan aktualny" | "Historia")
 */
export function LejkiSection({
  editingCard,
  setEditingCard,
  onSetStatus,
  onAddScore,
}: LejkiSectionProps) {
  const lead = useCurrentLead();

  return (
    <main className="flex min-h-0 flex-1 flex-col px-4 pt-6 md:px-8">
      <div className="mb-5 shrink-0">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink-1">Lejki</h1>
        <p className="mt-1 text-sm text-ink-3">
          {lead.funnel.name} · zarządzanie statusem i punktacją
        </p>
      </div>

      {/* Desktop: independent scrolling 5/7 split */}
      <div className="hidden min-h-0 flex-1 grid-cols-12 gap-8 pb-6 lg:grid">
        <div className="col-span-5 min-h-0 overflow-y-auto pr-2 [scrollbar-width:thin]">
          <CurrentStateColumn editingCard={editingCard} setEditingCard={setEditingCard} />
        </div>
        <div className="col-span-7 flex min-h-0 flex-col pb-2">
          <HistoryColumn onSetStatus={onSetStatus} onAddScore={onAddScore} />
        </div>
      </div>

      {/* Tablet/mobile tabs */}
      <Tabs defaultValue="state" className="min-h-0 flex-1 overflow-y-auto lg:hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="state">Stan aktualny</TabsTrigger>
          <TabsTrigger value="history">Historia</TabsTrigger>
        </TabsList>
        <TabsContent value="state" className="mt-4">
          <CurrentStateColumn editingCard={editingCard} setEditingCard={setEditingCard} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <HistoryColumn onSetStatus={onSetStatus} onAddScore={onAddScore} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
