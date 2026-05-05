import { useTheme } from "next-themes";
import { ChevronDown, Github, Menu, Moon, PanelLeft, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { leads } from "@/data/fixtures";
import { useCurrentLead, useLejkiStore } from "@/store/lejkiStore";
import { getSectionLabel, type SectionKey } from "./sections";

const REPO_ZIP_URL = "https://github.com/Vernex2026/lead-flow-tracker/archive/refs/heads/main.zip";

interface AppHeaderProps {
  active: SectionKey;
  onOpenDrawer: () => void;
  onToggleSidebar: () => void;
}

/**
 * Sticky topbar z 3 sekcjami:
 * - LEFT: menu (mobile) / sidebar collapse toggle (desktop) + breadcrumbs
 *   (YouLead / Kontakty / lead picker dropdown / aktywna sekcja)
 * - RIGHT: link do pobrania kodu źródłowego (GitHub ZIP) + theme toggle
 */
export function AppHeader({ active, onOpenDrawer, onToggleSidebar }: AppHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const lead = useCurrentLead();
  const setLeadId = useLejkiStore((s) => s.setLeadId);

  return (
    <header className="h-12 shrink-0 border-b border-border bg-surface/80 backdrop-blur">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Otwórz menu"
            onClick={onOpenDrawer}
            className="h-8 w-8 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Przełącz sidebar"
            onClick={onToggleSidebar}
            className="hidden h-8 w-8 md:inline-flex"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <nav aria-label="Ścieżka nawigacji" className="flex items-baseline gap-2 text-sm">
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent">
              YouLead
            </span>
            <span className="hidden text-ink-4 sm:inline" aria-hidden>
              /
            </span>
            <span className="hidden text-ink-3 sm:inline">Kontakty</span>
            <span className="hidden text-ink-4 sm:inline" aria-hidden>
              /
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={`Aktualny lead: ${lead.name}. Kliknij aby zmienić`}
                  className="inline-flex items-center gap-1 rounded px-1 font-medium text-ink-1 hover:bg-surface-2"
                >
                  {lead.name}
                  <ChevronDown className="h-3 w-3 text-ink-3" aria-hidden />
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
            <span className="text-ink-4" aria-hidden>
              /
            </span>
            <span className="text-ink-2">{getSectionLabel(active)}</span>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 px-2.5 text-ink-2 hover:text-ink-1"
          >
            <a
              href={REPO_ZIP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pobierz kod źródłowy projektu (ZIP z GitHub)"
              title="Pobierz kod źródłowy (.zip)"
            >
              <Github className="h-3.5 w-3.5" aria-hidden />
              <span className="hidden text-xs font-medium sm:inline">Kod źródłowy</span>
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Przełącz na jasny motyw" : "Przełącz na ciemny motyw"}
            aria-pressed={isDark}
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="h-8 w-8"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
