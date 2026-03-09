import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, Circle } from "lucide-react";

type DiaperType = "pee" | "poo" | "mixed" | "dry";

interface DiaperLogModalProps {
  open: boolean;
  onClose: () => void;
  onLog: (categoryId: string, detail: string) => void;
}

const diaperOptions: { id: DiaperType; label: string; emoji: string }[] = [
  { id: "pee", label: "Pee", emoji: "💧" },
  { id: "poo", label: "Poo", emoji: "💩" },
  { id: "mixed", label: "Mixed", emoji: "💧💩" },
  { id: "dry", label: "Dry Change", emoji: "✨" },
];

const DiaperLogModal = ({ open, onClose, onLog }: DiaperLogModalProps) => {
  const [diaperType, setDiaperType] = useState<DiaperType>("pee");

  const handleLog = () => {
    const option = diaperOptions.find((o) => o.id === diaperType);
    const label = option?.label || "Diaper";
    onLog("diaper", `${label} diaper`);
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
          >
            <div className="bg-card rounded-t-3xl p-5 pb-8 shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-foreground">Log Diaper</h3>
                <button onClick={onClose} className="p-1.5 rounded-full bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Diaper type grid */}
              <div className="grid grid-cols-2 gap-3">
                {diaperOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setDiaperType(option.id)}
                    className={`flex flex-col items-center gap-2 py-5 rounded-2xl text-sm font-medium transition-all ${
                      diaperType === option.id
                        ? "bg-diaper/15 text-diaper border-2 border-diaper/30 scale-[1.02]"
                        : "bg-muted text-muted-foreground border-2 border-transparent"
                    }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>

              {/* Log button */}
              <button
                onClick={handleLog}
                className="w-full mt-6 py-3 rounded-2xl bg-diaper text-primary-foreground text-sm font-semibold active:scale-[0.98] transition-transform"
              >
                Log Diaper
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DiaperLogModal;
