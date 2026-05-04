import { useEffect, useState } from "react";
import { ContactSidebar } from "./ContactSidebar";
import { AppHeader } from "./AppHeader";
import { MobileDrawer } from "./MobileDrawer";
import { SectionRouter } from "./SectionRouter";
import type { EditingCard } from "./CurrentStateColumn";

const TABLET_BREAKPOINT = "(max-width: 1023px)";

/**
 * Root layout aplikacji: sidebar | header + main content.
 * Trzyma cross-section state (active section, sidebar collapse, drawer)
 * — child komponenty są stateless props consumers.
 */
export function LejkiPanel() {
  const [active, setActive] = useState("lejki");
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<EditingCard>(null);

  // Auto-collapse sidebar na tablet width.
  useEffect(() => {
    const mq = window.matchMedia(TABLET_BREAKPOINT);
    const apply = () => setCollapsed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const openLejkiCard = (card: EditingCard) => {
    setActive("lejki");
    setEditingCard(card);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <div className="hidden h-full md:block">
        <ContactSidebar collapsed={collapsed} active={active} onSelect={setActive} />
      </div>

      <MobileDrawer
        open={drawerOpen}
        active={active}
        onClose={() => setDrawerOpen(false)}
        onSelect={setActive}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          active={active}
          onOpenDrawer={() => setDrawerOpen(true)}
          onToggleSidebar={() => setCollapsed((c) => !c)}
        />
        <SectionRouter
          active={active}
          editingCard={editingCard}
          setEditingCard={setEditingCard}
          onSetStatus={() => openLejkiCard("status")}
          onAddScore={() => openLejkiCard("scoring")}
        />
      </div>
    </div>
  );
}
