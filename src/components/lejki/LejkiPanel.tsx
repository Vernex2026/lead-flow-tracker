import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactSidebar } from "@/components/lejki/ContactSidebar";
import { CurrentStateColumn, type EditingCard } from "@/components/lejki/CurrentStateColumn";
import { DocsPanel } from "@/components/lejki/DocsPanel";
import { HistoryColumn } from "@/components/lejki/HistoryColumn";
import { LejkiHeader } from "@/components/lejki/LejkiHeader";
import { MobileDrawer } from "@/components/lejki/MobileDrawer";
import { SECTION_LABEL } from "@/components/lejki/sections";
import { useCurrentLead } from "@/store/lejkiStore";
import { useMediaQuery } from "@/hooks/use-media-query";

const TABLET_BREAKPOINT_QUERY = "(max-width: 1023px)";

export function LejkiPanel() {
  const [active, setActive] = useState("lejki");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [manuallyCollapsed, setManuallyCollapsed] = useState<boolean | null>(null);
  const [editingCard, setEditingCard] = useState<EditingCard>(null);

  const isTablet = useMediaQuery(TABLET_BREAKPOINT_QUERY);
  const collapsed = manuallyCollapsed ?? isTablet;
  const lead = useCurrentLead();

  const openStatusEdit = () => {
    setActive("lejki");
    setEditingCard("status");
  };
  const openScoringEdit = () => {
    setActive("lejki");
    setEditingCard("scoring");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <div className="hidden h-full md:block">
        <ContactSidebar collapsed={collapsed} active={active} onSelect={setActive} />
      </div>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        active={active}
        onSelect={setActive}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <LejkiHeader
          active={active}
          onOpenDrawer={() => setDrawerOpen(true)}
          onToggleSidebar={() => setManuallyCollapsed((c) => !(c ?? isTablet))}
        />

        {active === "lejki" ? (
          <main className="flex min-h-0 flex-1 flex-col px-4 pt-6 md:px-8">
            <div className="mb-5 shrink-0">
              <h1 className="text-[22px] font-semibold tracking-tight text-ink-1">Lejki</h1>
              <p className="mt-1 text-sm text-ink-3">
                {lead.funnel.name} · zarządzanie statusem i punktacją
              </p>
            </div>

            <div className="hidden min-h-0 flex-1 grid-cols-12 gap-8 pb-6 lg:grid">
              <div className="col-span-5 min-h-0 overflow-y-auto pr-2 [scrollbar-width:thin]">
                <CurrentStateColumn editingCard={editingCard} setEditingCard={setEditingCard} />
              </div>
              <div className="col-span-7 flex min-h-0 flex-col pb-2">
                <HistoryColumn onSetStatus={openStatusEdit} onAddScore={openScoringEdit} />
              </div>
            </div>

            <Tabs defaultValue="state" className="min-h-0 flex-1 overflow-y-auto lg:hidden">
              <TabsList className="sticky top-0 z-20 grid w-full grid-cols-2 shadow-xs">
                <TabsTrigger value="state">Stan aktualny</TabsTrigger>
                <TabsTrigger value="history">Historia</TabsTrigger>
              </TabsList>
              <TabsContent value="state" className="mt-4">
                <CurrentStateColumn editingCard={editingCard} setEditingCard={setEditingCard} />
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <HistoryColumn onSetStatus={openStatusEdit} onAddScore={openScoringEdit} />
              </TabsContent>
            </Tabs>
          </main>
        ) : (
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-8">
            {active === "docs" ? (
              <DocsPanel />
            ) : (
              <SectionStub label={SECTION_LABEL[active] ?? active} />
            )}
          </main>
        )}
      </div>
    </div>
  );
}

function SectionStub({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-border bg-surface p-12 text-center">
      <h1 className="text-[22px] font-semibold tracking-tight text-ink-1">{label}</h1>
      <p className="mt-2 text-sm text-ink-3">
        Ta sekcja nie jest częścią obecnego prototypu.
      </p>
    </div>
  );
}
