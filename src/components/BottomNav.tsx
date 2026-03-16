import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, BarChart3, Lightbulb, Baby, Settings, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { categories, type TrackingCategory } from "./TrackingGrid";

const commandAliases: Record<string, string[]> = {
  sleep: ["sleep", "nap", "bedtime"],
  feed: ["feed", "feeding", "bottle", "nurse", "nursing", "eat"],
  diaper: ["diaper", "nappy", "change"],
  temp: ["temperature", "temp", "fever"],
  growth: ["growth", "weight", "height", "measure"],
  meds: ["medicine", "meds", "medication"],
  pump: ["pump", "pumping", "express"],
  notes: ["note", "notes"],
  bath: ["bath", "bathe", "bathing"],
  tummy: ["tummy", "tummy time"],
  story: ["story", "story time", "read", "reading"],
  screen: ["screen", "screen time", "tv", "television"],
  skincare: ["skin", "skin to skin", "cuddle"],
  play: ["play", "playing", "outdoor", "indoor"],
  brush: ["brush", "teeth", "brush teeth"],
};

function matchCategory(transcript: string): TrackingCategory | null {
  const lower = transcript.toLowerCase().trim();
  for (const [catId, aliases] of Object.entries(commandAliases)) {
    for (const alias of aliases) {
      if (lower.includes(alias)) {
        return categories.find((c) => c.id === catId) || null;
      }
    }
  }
  return null;
}

function parseAction(transcript: string): "start" | "stop" | "log" {
  const lower = transcript.toLowerCase();
  if (lower.includes("stop") || lower.includes("end") || lower.includes("finish") || lower.includes("done")) return "stop";
  if (lower.includes("start") || lower.includes("begin") || lower.includes("timer")) return "start";
  return "log";
}

interface BottomNavProps {
  onVoiceCommand?: (command: string, category: TrackingCategory | null) => void;
  activeTimerCategory?: TrackingCategory | null;
}

const leftTabs = [
  { id: "/", label: "Home", icon: Home },
  { id: "/reports", label: "Reports", icon: BarChart3 },
];

const rightTabs = [
  { id: "/child", label: "Child", icon: Baby },
  { id: "/settings", label: "Settings", icon: Settings },
];

const BottomNav = ({ onVoiceCommand, activeTimerCategory }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      if (interim) setTranscript(interim);
      if (final) {
        setTranscript(final);
        handleVoiceInput(final);
      }
    };

    recognition.onerror = () => setIsListening(false);

    recognition.onend = () => {
      if (recognitionRef.current?._shouldListen) {
        try { recognition.start(); } catch {}
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const handleVoiceInput = useCallback(
    (text: string) => {
      const action = parseAction(text);
      const cat = matchCategory(text);

      if (action === "stop" && activeTimerCategory) {
        setFeedback(`Stopping ${activeTimerCategory.label} timer`);
        onVoiceCommand?.("stop", activeTimerCategory);
      } else if (cat) {
        setFeedback(`${action === "start" ? "Starting" : "Logging"} ${cat.label}`);
        onVoiceCommand?.(action, cat);
      } else {
        setFeedback(`Try "start sleep" or "log diaper"`);
      }

      setTimeout(() => {
        setFeedback("");
        setTranscript("");
      }, 2500);
    },
    [activeTimerCategory, onVoiceCommand]
  );

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current._shouldListen = false;
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current._shouldListen = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setFeedback("Listening...");
        setTimeout(() => setFeedback(""), 2000);
      } catch {
        setFeedback("Mic unavailable");
      }
    }
  }, [isListening]);

  if (location.pathname === "/auth") return null;

  const renderTab = (tab: typeof leftTabs[0]) => {
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

  return (
    <>
      {/* Voice feedback bubble */}
      <AnimatePresence>
        {(transcript || feedback) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-card rounded-2xl px-4 py-3 tracking-card-shadow max-w-[240px] text-center"
          >
            {transcript && (
              <p className="text-xs text-muted-foreground italic">"{transcript}"</p>
            )}
            {feedback && (
              <p className="text-xs font-medium text-foreground mt-0.5">{feedback}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] relative">
          {/* Left tabs */}
          {leftTabs.map(renderTab)}

          {/* Center mic button */}
          <div className="flex flex-col items-center -mt-7">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleListening}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors relative ${
                isListening
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/90 text-primary-foreground"
              }`}
            >
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive animate-pulse" />
                </>
              )}
              <Mic className="w-6 h-6 relative z-10" />
            </motion.button>
            <span className={`text-[9px] font-medium mt-0.5 ${isListening ? "text-primary" : "text-muted-foreground"}`}>
              {isListening ? "Listening" : "Voice"}
            </span>
          </div>

          {/* Right tabs */}
          {rightTabs.map(renderTab)}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
