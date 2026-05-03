import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/primitives/Avatar";
import { useLejkiStore } from "@/store/lejkiStore";

export function OwnerCard() {
  const owner = useLejkiStore((s) => s.owner);
  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-xs transition-all hover:-translate-y-px hover:shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">Opiekun</h3>
      </header>
      <div className="flex items-center gap-3">
        <Avatar name={owner.name} size={40} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-ink-1">{owner.name}</div>
          {owner.email && <div className="truncate text-xs text-ink-3">{owner.email}</div>}
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-ink-2">Zmień</Button>
      </div>
    </section>
  );
}
