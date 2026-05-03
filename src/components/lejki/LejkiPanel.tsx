import { useEffect, useState } from "react";
import { Moon, Sun, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CurrentStateColumn } from "@/components/lejki/CurrentStateColumn";
import { HistoryColumn } from "@/components/lejki/HistoryColumn";
import { ContactSidebar } from "@/components/lejki/ContactSidebar";
import { lead } from "@/data/fixtures";

export function LejkiPanel() {
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 1280 : false,
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onResize = () => setCollapsed(window.innerWidth <= 1280);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop / tablet sidebar */}
      <div className="hidden md:block">
        <ContactSidebar collapsed={collapsed} />
      </div>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-border bg-surface/80 backdrop-blur">
          <div className="flex items-center justify-between px-6 py-3.5">
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
                <span className="text-ink-2">Lejki</span>
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

        <main className="px-4 py-8 md:px-8">
          <div className="mb-6">
            <h1 className="text-[22px] font-semibold tracking-tight text-ink-1">Lejki</h1>
            <p className="mt-1 text-sm text-ink-3">
              {lead.funnel.name} · zarządzanie statusem i punktacją
            </p>
          </div>

          {/* Desktop split */}
          <div className="hidden grid-cols-12 gap-8 lg:grid">
            <div className="col-span-5">
              <CurrentStateColumn />
            </div>
            <div className="col-span-7">
              <HistoryColumn />
            </div>
          </div>

          {/* Tablet/mobile tabs */}
          <Tabs defaultValue="state" className="lg:hidden">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="state">Stan aktualny</TabsTrigger>
              <TabsTrigger value="history">Historia</TabsTrigger>
            </TabsList>
            <TabsContent value="state" className="mt-4">
              <CurrentStateColumn />
            </TabsContent>
            <TabsContent value="history" className="mt-4">
              <HistoryColumn />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
