import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, Camera, MessageSquare, Moon, UtensilsCrossed,
  Droplets
} from "lucide-react";
import type { TrackingCategory } from "./TrackingGrid";
import { categories } from "./TrackingGrid";

interface SmartLogFABProps {
  onQuickLog: (categoryId: string, detail: string) => void;
  onStartTimer: (category: TrackingCategory) => void;
}

const quickActions = [
  { id: "voice", label: "Voice log", icon: Mic, color: "bg-primary" },
  { id: "ai-text", label: "AI text log", icon: MessageSquare, color: "bg-sleep" },
  { id: "photo", label: "Photo log", icon: Camera, color: "bg-feed" },
  { id: "last-feed", label: "Repeat last feed", icon: UtensilsCrossed, color: "bg-feed" },
  { id: "last-diaper", label: "Quick diaper", icon: Droplets, color: "bg-diaper" },
  { id: "last-sleep", label: "Start sleep", icon: Moon, color: "bg-sleep" },
];

const SmartLogFAB = ({ onQuickLog, onStartTimer, onVoiceCommand, activeTimerCategory }: SmartLogFABProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [aiTextMode, setAiTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");

  const handleAction = useCallback((actionId: string) => {
    switch (actionId) {
      case "voice":
        setIsOpen(false);
        // Try to start voice recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          onVoiceCommand("listen", null);
        }
        break;
      case "ai-text":
        setAiTextMode(true);
        break;
      case "photo":
        // Future: open camera/gallery for daycare note scanning
        setIsOpen(false);
        break;
      case "last-feed": {
        onQuickLog("feed", "Bottle — 5 oz (repeated)");
        setIsOpen(false);
        break;
      }
      case "last-diaper":
        onQuickLog("diaper", "Wet diaper");
        setIsOpen(false);
        break;
      case "last-sleep": {
        const sleepCat = categories.find(c => c.id === "sleep");
        if (sleepCat) onStartTimer(sleepCat);
        setIsOpen(false);
        break;
      }
    }
  }, [onQuickLog, onStartTimer, onVoiceCommand]);

  const handleAITextSubmit = useCallback(() => {
    if (!textInput.trim()) return;
    
    // Parse natural language input — simple pattern matching for now
    const text = textInput.toLowerCase();
    
    if (text.includes("bottle") || text.includes("fed") || text.includes("feed") || text.includes("oz") || text.includes("nursed") || text.includes("formula")) {
      onQuickLog("feed", textInput);
    } else if (text.includes("diaper") || text.includes("pee") || text.includes("poop") || text.includes("wet") || text.includes("dirty")) {
      onQuickLog("diaper", textInput);
    } else if (text.includes("sleep") || text.includes("nap") || text.includes("woke") || text.includes("bed")) {
      onQuickLog("sleep", textInput);
    } else if (text.includes("pump")) {
      onQuickLog("pump", textInput);
    } else if (text.includes("bath")) {
      onQuickLog("bath", textInput);
    } else if (text.includes("tummy")) {
      onQuickLog("tummy", textInput);
    } else {
      onQuickLog("notes", textInput);
    }

    setTextInput("");
    setAiTextMode(false);
    setIsOpen(false);
  }, [textInput, onQuickLog]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setIsOpen(false); setAiTextMode(false); }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* FAB and menu */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
        {/* AI Text Input */}
        <AnimatePresence>
          {isOpen && aiTextMode && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="bg-card rounded-2xl p-4 tracking-card-shadow w-72 mb-2"
            >
              <p className="text-xs font-semibold text-foreground mb-2">
                Type naturally — we'll figure it out
              </p>
              <p className="text-[10px] text-muted-foreground mb-3">
                e.g. "fed 5oz formula at 2pm" or "wet diaper just now" or "napped 1h in crib"
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAITextSubmit()}
                  placeholder="Type what happened..."
                  autoFocus
                  className="flex-1 bg-muted rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleAITextSubmit}
                  className="bg-primary text-primary-foreground rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  Log
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick action buttons */}
        <AnimatePresence>
          {isOpen && !aiTextMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-end gap-2 mb-2"
            >
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => handleAction(action.id)}
                  className="flex items-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="bg-card rounded-xl px-3 py-2 text-xs font-medium text-foreground tracking-card-shadow whitespace-nowrap">
                    {action.label}
                  </span>
                  <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center shadow-md`}>
                    <action.icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { setIsOpen(!isOpen); setAiTextMode(false); }}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isOpen
              ? "bg-destructive text-destructive-foreground rotate-45"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {isOpen ? <X className="w-6 h-6 -rotate-45" /> : <Plus className="w-6 h-6" />}
        </motion.button>
      </div>
    </>
  );
};

export default SmartLogFAB;
