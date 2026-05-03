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
import { lead } from "@/data/fixtures";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Item = { key: string; label: string; icon: LucideIcon };
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
}: {
  collapsed: boolean;
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={300}>
      <aside
        className={cn(
          "sticky top-0 z-20 h-screen shrink-0 border-r border-border bg-surface transition-[width] duration-200",
          collapsed ? "w-[56px]" : "w-[240px]",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 border-b border-border px-3 py-4",
            collapsed && "justify-center px-2",
          )}
        >
          <Avatar name={lead.name} size={collapsed ? 24 : 32} />
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-ink-1">{lead.name}</div>
              <div className="truncate text-[11px] text-ink-3">{lead.email}</div>
            </div>
          )}
        </div>

        <nav className="overflow-y-auto px-2 py-3" style={{ maxHeight: "calc(100vh - 73px)" }}>
          {GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-3" : ""}>
              {!collapsed && group.title && (
                <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-4">
                  {group.title}
                </div>
              )}
              {collapsed && gi > 0 && <div className="mx-2 mb-2 h-px bg-border" />}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = item.key === active;
                  const Icon = item.icon;
                  const button = (
                    <button
                      onClick={() => onSelect(item.key)}
                      className={cn(
                        "relative flex w-full items-center gap-2.5 rounded-md py-2 text-[13px] transition-colors",
                        collapsed ? "justify-center px-0" : "px-2.5",
                        isActive
                          ? "bg-surface-2 font-medium text-ink-1"
                          : "text-ink-3 hover:bg-surface-2 hover:text-ink-1",
                      )}
                    >
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-accent-600"
                        />
                      )}
                      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
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
      </aside>
    </TooltipProvider>
  );
}
