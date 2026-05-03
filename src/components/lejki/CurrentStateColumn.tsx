import { StatusCard } from "./StatusCard";
import { ScoringCard } from "./ScoringCard";
import { OwnerCard } from "./OwnerCard";

export type EditingCard = "status" | "scoring" | null;

export function CurrentStateColumn({
  editingCard,
  setEditingCard,
}: {
  editingCard: EditingCard;
  setEditingCard: (c: EditingCard) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        Stan aktualny
      </h2>
      <StatusCard
        isEditing={editingCard === "status"}
        onEditStart={() => setEditingCard("status")}
        onClose={() => setEditingCard(null)}
      />
      <ScoringCard
        isEditing={editingCard === "scoring"}
        onEditStart={() => setEditingCard("scoring")}
        onClose={() => setEditingCard(null)}
      />
      <OwnerCard />
    </div>
  );
}
