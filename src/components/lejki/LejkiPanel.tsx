import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, PanelLeft, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CurrentStateColumn, type EditingCard } from "@/components/lejki/CurrentStateColumn";
import { HistoryColumn } from "@/components/lejki/HistoryColumn";
import { ContactSidebar } from "@/components/lejki/ContactSidebar";
import { DocsPanel } from "@/components/lejki/DocsPanel";
import { leads } from "@/data/fixtures";
import { useCurrentLead, useLejkiStore } from "@/store/lejkiStore";

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<EditingCard>(null);
  const lead = useCurrentLead();
  const setLeadId = useLejkiStore((s) => s.setLeadId);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // ESC closes mobile drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Auto-collapse on tablet width (<1024)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

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
      {/* Desktop / tablet sidebar (hidden on mobile) */}
      <div className="hidden h-full md:block">
        <ContactSidebar collapsed={collapsed} active={active} onSelect={setActive} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              key="drawer"
              className="fixed inset-y-0 left-0 z-50 w-[280px] md:hidden"
              style={{ boxShadow: "8px 0 32px rgba(0,0,0,0.12)" }}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
            >
              <ContactSidebar
                collapsed={false}
                active={active}
                onSelect={setActive}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="h-12 shrink-0 border-b border-border bg-surface/80 backdrop-blur">
          <div className="flex h-full items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Otwórz menu"
                onClick={() => setDrawerOpen(true)}
                className="h-8 w-8 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
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
                <span className="hidden text-ink-4 sm:inline">/</span>
                <span className="hidden text-ink-3 sm:inline">Kontakty</span>
                <span className="hidden text-ink-4 sm:inline">/</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1 rounded px-1 font-medium text-ink-1 hover:bg-surface-2">
                      {lead.name}
                      <ChevronDown className="h-3 w-3 text-ink-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {leads.map((l) => (
                      <DropdownMenuItem key={l.id} onClick={() => setLeadId(l.id)}>
                        <div className="flex flex-col">
                          <span className="text-[13px]">{l.name}</span>
                          <span className="text-[11px] text-ink-3">
                            {l.events.length === 0 ? "Bez historii" : `${l.events.length} zdarzeń`}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <HistoryColumn onSetStatus={openStatusEdit} onAddScore={openScoringEdit} />
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
                <HistoryColumn onSetStatus={openStatusEdit} onAddScore={openScoringEdit} />
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
