import { useEffect, useState } from "react";
import { Moon, Sun, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CurrentStateColumn, type EditingCard } from "@/components/lejki/CurrentStateColumn";
import { HistoryColumn } from "@/components/lejki/HistoryColumn";
import { ContactSidebar } from "@/components/lejki/ContactSidebar";
import { DocsPanel } from "@/components/lejki/DocsPanel";
import { lead } from "@/data/fixtures";

const SECTION_LABEL: Record<string, string> = {
  data: "Dane klienta",
  consents: "Zgody",
  tags: "Tagi",
  lejki: "Lejki",
  messages: "Wiadomości",
  sessions: "Sesje WWW",
  forms: "Formularze",
  products: "Produkty",
  purchases: "Zakupy",
  events: "Zdarzenia własne",
  scenarios: "Scenariusze",
  docs: "Dokumentacja",
};

export function LejkiPanel() {
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("lejki");
  const [collapsed, setCollapsed] = useState(false);
  const [editingCard, setEditingCard] = useState<EditingCard>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Desktop / tablet sidebar */}
      <div className="hidden h-full md:block">
        <ContactSidebar collapsed={collapsed} active={active} onSelect={setActive} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-border bg-surface/80 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Przełącz sidebar"
                onClick={() => setCollapsed((c) => !c)}
                className="hidden h-8 w-8 md:inline-flex"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">
                  YouLead
                </span>
                <span className="text-ink-4">/</span>
                <span className="text-ink-3">Kontakty</span>
                <span className="text-ink-4">/</span>
                <span className="font-medium text-ink-1">{lead.name}</span>
                <span className="text-ink-4">/</span>
                <span className="text-ink-2">{SECTION_LABEL[active] ?? "Lejki"}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Przełącz motyw"
              onClick={() => setDark((d) => !d)}
              className="h-8 w-8"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {active === "lejki" ? (
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
                <HistoryColumn />
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
                <HistoryColumn />
              </TabsContent>
            </Tabs>
          </main>
        ) : (
          <main className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-8">
            {active === "docs" ? (
              <DocsPanel />
            ) : (
              <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-border bg-surface p-12 text-center">
                <h1 className="text-[22px] font-semibold tracking-tight text-ink-1">
                  {SECTION_LABEL[active]}
                </h1>
                <p className="mt-2 text-sm text-ink-3">
                  Ta sekcja nie jest częścią obecnego prototypu.
                </p>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
