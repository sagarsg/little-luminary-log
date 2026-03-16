import { useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Baby, Settings, Mic, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVoiceConversation } from "@/hooks/useVoiceConversation";

const leftTabs = [
  { id: "/", label: "Home", icon: Home },
  { id: "/reports", label: "Reports", icon: BarChart3 },
];

const rightTabs = [
  { id: "/child", label: "Child", icon: Baby },
  { id: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogEntry = (categoryId: string, detail: string, durationSeconds?: number) => {
    window.dispatchEvent(
      new CustomEvent("voice-log-entry", {
        detail: { categoryId, detail, durationSeconds },
      })
    );
  };

  const voice = useVoiceConversation(handleLogEntry);

  if (location.pathname === "/auth") return null;

  const renderTab = (tab: { id: string; label: string; icon: any }) => {
    const isActive = location.pathname === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => navigate(tab.id)}
        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <tab.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
        <span className="text-[10px] font-medium">{tab.label}</span>
      </button>
    );
  };

  const isActive = voice.conversationActive;

  return (
    <>
      {/* Voice conversation bubble */}
      <AnimatePresence>
        {(voice.transcript || voice.botMessage) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-card rounded-2xl px-4 py-3 tracking-card-shadow max-w-[280px] text-center"
          >
            {voice.botMessage && (
              <p className="text-xs font-medium text-foreground">{voice.botMessage}</p>
            )}
            {voice.transcript && (
              <p className="text-xs text-muted-foreground italic mt-1">"{voice.transcript}"</p>
            )}
            {voice.isProcessing && (
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-[10px] text-muted-foreground">Thinking...</span>
              </div>
            )}
            {voice.isSpeaking && (
              <div className="flex items-center justify-center gap-1 mt-1.5">
                <span className="w-1 h-3 bg-primary rounded-full animate-pulse" />
                <span className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75" />
                <span className="w-1 h-3 bg-primary rounded-full animate-pulse delay-150" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] relative">
          {leftTabs.map(renderTab)}

          {/* Center mic button — raised */}
          <div className="flex flex-col items-center -mt-7">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => (isActive ? voice.stopConversation() : voice.startConversation())}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors relative ${
                isActive
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-primary/90 text-primary-foreground"
              }`}
            >
              {isActive && voice.isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-destructive animate-ping opacity-20" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive animate-pulse" />
                </>
              )}
              {isActive ? (
                <X className="w-6 h-6 relative z-10" />
              ) : (
                <Mic className="w-6 h-6 relative z-10" />
              )}
            </motion.button>
            <span className={`text-[9px] font-medium mt-0.5 ${isActive ? "text-destructive" : "text-muted-foreground"}`}>
              {isActive
                ? voice.isProcessing
                  ? "Thinking"
                  : voice.isSpeaking
                  ? "Speaking"
                  : "Listening"
                : "Voice"}
            </span>
          </div>

          {rightTabs.map(renderTab)}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
