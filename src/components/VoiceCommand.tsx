import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { categories, type TrackingCategory } from "./TrackingGrid";

interface VoiceCommandProps {
  onCommand: (command: string, category: TrackingCategory | null) => void;
  activeTimerCategory: TrackingCategory | null;
}

// Extend window for SpeechRecognition
interface SpeechRecognitionEvent {
  results: { [key: number]: { [key: number]: { transcript: string } }; length: number };
  resultIndex: number;
}

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

const VoiceCommand = ({ onCommand, activeTimerCategory }: VoiceCommandProps) => {
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

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if ((result as any).isFinal) {
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

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      // Restart if still supposed to be listening
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
        onCommand("stop", activeTimerCategory);
      } else if (cat) {
        setFeedback(`${action === "start" ? "Starting" : "Logging"} ${cat.label}`);
        onCommand(action, cat);
      } else {
        setFeedback(`Didn't catch that. Try "start sleep" or "log diaper"`);
      }

      setTimeout(() => {
        setFeedback("");
        setTranscript("");
      }, 2500);
    },
    [activeTimerCategory, onCommand]
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
        setFeedback("Listening... say a command");
        setTimeout(() => setFeedback(""), 2000);
      } catch {
        setFeedback("Could not start microphone");
      }
    }
  }, [isListening]);

  if (!supported) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Feedback bubble */}
      <AnimatePresence>
        {(transcript || feedback) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="bg-card rounded-2xl px-4 py-3 tracking-card-shadow max-w-[220px]"
          >
            {transcript && (
              <p className="text-xs text-muted-foreground italic">"{transcript}"</p>
            )}
            {feedback && (
              <p className="text-xs font-medium text-foreground mt-1">{feedback}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
          isListening
            ? "bg-primary text-primary-foreground"
            : "bg-card text-foreground tracking-card-shadow"
        }`}
      >
        {isListening ? (
          <div className="relative">
            <Mic className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-destructive animate-pulse" />
          </div>
        ) : (
          <MicOff className="w-5 h-5 text-muted-foreground" />
        )}
      </motion.button>

      {isListening && (
        <p className="text-[10px] text-muted-foreground text-center">
          Hands-free mode
        </p>
      )}
    </div>
  );
};

export default VoiceCommand;
