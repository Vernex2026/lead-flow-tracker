import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CurrentStateColumn } from "@/components/lejki/CurrentStateColumn";
import { HistoryColumn } from "@/components/lejki/HistoryColumn";
import { lead } from "@/data/fixtures";

const TABS = ["Dane klienta", "Zgody", "Tagi", "Lejki", "Wiadomości", "Sesje WWW", "Formularze", "Produkty", "Zakupy"];

export function LejkiPanel() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-accent">YouLead</span>
            <span className="text-ink-4">/</span>
            <span className="text-sm text-ink-3">Kontakty</span>
            <span className="text-ink-4">/</span>
            <span className="text-sm font-medium text-ink-1">{lead.name}</span>
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
        <nav className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-6">
          {TABS.map((t) => (
            <button
              key={t}
              className={
                "border-b-2 px-3 py-2.5 text-[13px] transition-colors " +
                (t === "Lejki"
                  ? "border-accent font-medium text-ink-1"
                  : "border-transparent text-ink-3 hover:text-ink-1")
              }
            >
              {t}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight text-ink-1">Lejki</h1>
            <p className="mt-1 text-sm text-ink-3">{lead.funnel.name} · zarządzanie statusem i punktacją</p>
          </div>
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
  );
}
