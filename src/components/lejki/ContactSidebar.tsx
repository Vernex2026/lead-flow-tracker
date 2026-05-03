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
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/primitives/Avatar";
import { lead } from "@/data/fixtures";

type Item = { key: string; label: string; icon: LucideIcon };
type Group = Item[];

const GROUPS: Group[] = [
  [
    { key: "data", label: "Dane klienta", icon: User },
    { key: "consents", label: "Zgody", icon: ShieldCheck },
    { key: "tags", label: "Tagi", icon: Tag },
  ],
  [{ key: "lejki", label: "Lejki", icon: Filter }],
  [
    { key: "messages", label: "Wiadomości", icon: MessageSquare },
    { key: "sessions", label: "Sesje WWW", icon: Globe },
    { key: "forms", label: "Formularze", icon: FileText },
  ],
  [
    { key: "products", label: "Produkty", icon: Package },
    { key: "purchases", label: "Zakupy", icon: ShoppingBag },
  ],
  [
    { key: "events", label: "Zdarzenia własne", icon: Activity },
    { key: "scenarios", label: "Scenariusze", icon: Workflow },
  ],
];

const ACTIVE = "lejki";

export function ContactSidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        "sticky top-0 z-20 h-screen shrink-0 border-r border-border bg-surface transition-[width] duration-200",
        collapsed ? "w-[52px]" : "w-[240px]",
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

      <nav className="px-2 py-3">
        {GROUPS.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="my-2 h-px bg-border" />}
            <ul className="space-y-0.5">
              {group.map((item) => {
                const isActive = item.key === ACTIVE;
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <button
                      title={collapsed ? item.label : undefined}
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
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
