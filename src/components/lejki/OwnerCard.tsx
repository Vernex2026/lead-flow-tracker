import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/primitives/Avatar";
import { useLejkiStore } from "@/store/lejkiStore";

export function OwnerCard() {
  const owner = useLejkiStore((s) => s.owner);
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-xs">
      <header className="mb-3">
        <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">
          Opiekun
        </h3>
      </header>
      <div className="flex items-center gap-3">
        <Avatar name={owner.name} size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-ink-1">{owner.name}</div>
          {owner.email && <div className="truncate text-xs text-ink-3">{owner.email}</div>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="-mr-1.5 h-7 shrink-0 px-2 text-ink-2"
        >
          Zmień
        </Button>
      </div>
    </section>
  );
}
