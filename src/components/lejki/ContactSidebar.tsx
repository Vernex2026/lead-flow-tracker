import {
  User,
  ShieldCheck,
  Tag,
  Filter,
  MessageSquare,
  Globe,
  FileText,
  Package,
  ShoppingBag,
  Activity,
  Workflow,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/primitives/Avatar";
import { useLejkiStore } from "@/store/lejkiStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SectionKey } from "./sections";

type Item = { key: SectionKey; label: string; icon: LucideIcon };
type Group = { title?: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: "Profil",
    items: [
      { key: "data", label: "Dane klienta", icon: User },
      { key: "consents", label: "Zgody", icon: ShieldCheck },
      { key: "tags", label: "Tagi", icon: Tag },
    ],
  },
  {
    title: "Sprzedaż",
    items: [{ key: "lejki", label: "Lejki", icon: Filter }],
  },
  {
    title: "Aktywność",
    items: [
      { key: "messages", label: "Wiadomości", icon: MessageSquare },
      { key: "sessions", label: "Sesje WWW", icon: Globe },
      { key: "forms", label: "Formularze", icon: FileText },
    ],
  },
  {
    title: "Komercja",
    items: [
      { key: "products", label: "Produkty", icon: Package },
      { key: "purchases", label: "Zakupy", icon: ShoppingBag },
    ],
  },
  {
    title: "Automatyzacja",
    items: [
      { key: "events", label: "Zdarzenia własne", icon: Activity },
      { key: "scenarios", label: "Scenariusze", icon: Workflow },
    ],
  },
  {
    title: "Pomoc",
    items: [{ key: "docs", label: "Dokumentacja", icon: BookOpen }],
  },
];

export function ContactSidebar({
  collapsed,
  active,
  onSelect,
  onNavigate,
}: {
  collapsed: boolean;
  active: SectionKey;
  onSelect: (key: SectionKey) => void;
  onNavigate?: () => void;
}) {
  const owner = useLejkiStore((s) => s.owner);

  const handleSelect = (k: SectionKey) => {
    onSelect(k);
    onNavigate?.();
  };

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={300}>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200",
          collapsed ? "w-[52px]" : "w-[240px]"
        )}
      >
        <nav className="flex-1 overflow-y-auto px-1.5 py-3">
          {GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-3" : ""}>
              {!collapsed && group.title && (
                <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                  {group.title}
                </div>
              )}
              {collapsed && gi > 0 && <div className="mx-1.5 mb-2 h-px bg-border" />}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.key === active;
                  const Icon = item.icon;
                  const button = (
                    <button
                      aria-label={item.label}
                      onClick={() => handleSelect(item.key)}
                      className={cn(
                        "relative flex w-full items-center transition-[opacity,background-color,color]",
                        collapsed
                          ? "justify-center rounded-md px-0 py-2"
                          : "gap-2.5 rounded-md px-2.5 py-2 text-[13px]",
                        isActive
                          ? "bg-surface-2 font-medium text-ink-1"
                          : "text-ink-3 hover:bg-surface-2 hover:text-ink-1"
                      )}
                    >
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-accent-600"
                        />
                      )}
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                      {!collapsed && (
                        <span className="truncate transition-opacity duration-75">
                          {item.label}
                        </span>
                      )}
                    </button>
                  );

                  return (
                    <li key={item.key}>
                      {collapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>{button}</TooltipTrigger>
                          <TooltipContent side="right" sideOffset={8}>
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        button
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User avatar pinned bottom-left (Slack/Linear/Notion pattern) */}
        <div
          className={cn(
            "sticky bottom-0 border-t border-border bg-surface",
            collapsed ? "flex justify-center px-0 py-3" : "flex items-center gap-2.5 px-3 py-3"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label={owner.name}
                  className="rounded-full outline-none ring-offset-surface focus-visible:ring-2 focus-visible:ring-ink-2 focus-visible:ring-offset-2"
                >
                  <Avatar name={owner.name} size={32} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                <div className="text-[12px] font-medium">{owner.name}</div>
                {owner.email && <div className="text-[11px] text-ink-3">{owner.email}</div>}
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
              <Avatar name={owner.name} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-ink-1">{owner.name}</div>
                {owner.email && (
                  <div className="truncate text-[11px] text-ink-3">{owner.email}</div>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
