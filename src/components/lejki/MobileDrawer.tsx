import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContactSidebar } from "./ContactSidebar";
import { useMotionConfig } from "@/hooks/useMotionConfig";
import type { SectionKey } from "./sections";

interface MobileDrawerProps {
  open: boolean;
  active: SectionKey;
  onClose: () => void;
  onSelect: (key: SectionKey) => void;
}

/**
 * Pełnoekranowy drawer z bocznym menu na mobile (<768px).
 * Obsługuje:
 * - Backdrop blur z dim (kliknięcie zamyka)
 * - Klawisz Esc zamyka
 * - role="dialog" + aria-modal — focus trap (browser native przy modal)
 * - max-w-[85vw] — zostawia pasek z prawej do tap-to-close
 */
export function MobileDrawer({ open, active, onClose, onSelect }: MobileDrawerProps) {
  const { fast, slow } = useMotionConfig();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            aria-hidden
            className="fixed inset-0 z-40 bg-ink-1/40 backdrop-blur-md md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fast}
            onClick={onClose}
          />
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu nawigacji"
            className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] bg-surface shadow-2xl md:hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={slow}
          >
            <ContactSidebar
              collapsed={false}
              active={active}
              onSelect={onSelect}
              onNavigate={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
