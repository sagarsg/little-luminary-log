import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VoiceEntry {
  categoryId: string;
  detail: string;
  durationSeconds?: number | null;
  loggedAt?: string | null;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

interface VoiceConversationState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  botMessage: string;
  conversationActive: boolean;
}

interface UseVoiceConversationReturn extends VoiceConversationState {
  startConversation: () => void;
  stopConversation: () => void;
  supported: boolean;
}

// Industry standard: 1.5s silence after speech ends triggers processing
const SILENCE_TIMEOUT_MS = 1500;

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to pick a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang.startsWith("en") && (v.name.includes("Samantha") || v.name.includes("Google") || v.name.includes("Natural"))
    );
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function useVoiceConversation(
  onLogEntry: (categoryId: string, detail: string, durationSeconds?: number, loggedAt?: string) => void
): UseVoiceConversationReturn {
  const [state, setState] = useState<VoiceConversationState>({
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
    transcript: "",
    botMessage: "",
    conversationActive: false,
  });

  const recognitionRef = useRef<any>(null);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef("");
  const supported = useRef(true);
  const shouldListenRef = useRef(false);

  // Initialize speech recognition once
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      supported.current = false;
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    // Load voices for TTS
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      try { recognition.stop(); } catch {}
      window.speechSynthesis?.cancel();
    };
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const processTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) return;

      setState((s) => ({ ...s, isListening: false, isProcessing: true, transcript }));

      // Stop recognition while processing
      try { recognitionRef.current?.stop(); } catch {}

      conversationHistoryRef.current.push({ role: "user", content: transcript });

      try {
        const { data, error } = await supabase.functions.invoke("voice-assistant", {
          body: {
            transcript,
            conversationHistory: conversationHistoryRef.current,
          },
        });

        if (error) throw error;

        const { action, message, entry } = data;

        conversationHistoryRef.current.push({ role: "assistant", content: message });

        setState((s) => ({ ...s, isProcessing: false, isSpeaking: true, botMessage: message }));

        // Speak the response
        await speak(message);

        setState((s) => ({ ...s, isSpeaking: false }));

        if (action === "log" && entry) {
          // Log the entry and end conversation
          shouldListenRef.current = false;
          try { recognitionRef.current?.stop(); } catch {}
          onLogEntry(
            entry.categoryId,
            entry.detail,
            entry.durationSeconds || undefined,
            entry.loggedAt || undefined
          );
          setState((s) => ({
            ...s,
            conversationActive: false,
            isListening: false,
            botMessage: message,
            transcript: "",
          }));
          conversationHistoryRef.current = [];
          // Clear message after a moment
          setTimeout(() => {
            setState((s) => ({ ...s, botMessage: "", transcript: "" }));
          }, 2000);
          return;
        }

        if (action === "cancel") {
          setState((s) => ({
            ...s,
            conversationActive: false,
            botMessage: message,
            transcript: "",
          }));
          conversationHistoryRef.current = [];
          setTimeout(() => {
            setState((s) => ({ ...s, botMessage: "", transcript: "" }));
          }, 2000);
          return;
        }

        // For "ask" or "confirm" — continue listening
        if (shouldListenRef.current) {
          startListening();
        }
      } catch (err) {
        console.error("Voice assistant error:", err);
        setState((s) => ({
          ...s,
          isProcessing: false,
          botMessage: "Something went wrong. Try again.",
        }));
        setTimeout(() => {
          setState((s) => ({ ...s, botMessage: "" }));
        }, 2500);
        if (shouldListenRef.current) {
          startListening();
        }
      }
    },
    [onLogEntry]
  );

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    finalTranscriptRef.current = "";

    recognition.onresult = (event: any) => {
      clearSilenceTimer();

      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += " " + final;
        finalTranscriptRef.current = finalTranscriptRef.current.trim();
      }

      const display = finalTranscriptRef.current + (interim ? " " + interim : "");
      setState((s) => ({ ...s, transcript: display.trim() }));

      // Reset silence timer — process after SILENCE_TIMEOUT_MS of no new results
      silenceTimerRef.current = setTimeout(() => {
        if (finalTranscriptRef.current.trim()) {
          const text = finalTranscriptRef.current.trim();
          finalTranscriptRef.current = "";
          processTranscript(text);
        }
      }, SILENCE_TIMEOUT_MS);
    };

    recognition.onerror = (event: any) => {
      // "no-speech" is not a real error, just means silence
      if (event.error === "no-speech") return;
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // Restart if we should still be listening and not processing
      if (shouldListenRef.current) {
        try { recognition.start(); } catch {}
      }
    };

    try {
      recognition.start();
      setState((s) => ({ ...s, isListening: true }));
    } catch {
      // Already started
    }
  }, [clearSilenceTimer, processTranscript]);

  const startConversation = useCallback(() => {
    if (!supported.current) return;
    shouldListenRef.current = true;
    conversationHistoryRef.current = [];
    setState({
      isListening: true,
      isProcessing: false,
      isSpeaking: false,
      transcript: "",
      botMessage: "I'm listening... what would you like to log?",
      conversationActive: true,
    });

    // Brief greeting then start listening
    speak("What would you like to log?").then(() => {
      setState((s) => ({ ...s, isSpeaking: false, botMessage: "" }));
      startListening();
    });

    setState((s) => ({ ...s, isSpeaking: true }));
  }, [startListening]);

  const stopConversation = useCallback(() => {
    shouldListenRef.current = false;
    clearSilenceTimer();
    try { recognitionRef.current?.stop(); } catch {}
    window.speechSynthesis?.cancel();
    conversationHistoryRef.current = [];
    finalTranscriptRef.current = "";
    setState({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      transcript: "",
      botMessage: "",
      conversationActive: false,
    });
  }, [clearSilenceTimer]);

  return {
    ...state,
    startConversation,
    stopConversation,
    supported: supported.current,
  };
}
