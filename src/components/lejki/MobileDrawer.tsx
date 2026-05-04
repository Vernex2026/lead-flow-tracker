import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { ContactSidebar } from "./ContactSidebar";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  active: string;
  onSelect: (key: string) => void;
}

export function MobileDrawer({ open, onClose, active, onSelect }: MobileDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
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
            transition={{ duration: 0.2 }}
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
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
