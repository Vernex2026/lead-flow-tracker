import { StatusCard } from "./StatusCard";
import { ScoringCard } from "./ScoringCard";
import { OwnerCard } from "./OwnerCard";

export function CurrentStateColumn() {
  return (
    <div className="space-y-4">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        Stan aktualny
      </h2>
      <StatusCard />
      <ScoringCard />
      <OwnerCard />
    </div>
  );
}
