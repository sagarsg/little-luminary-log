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

const SILENCE_TIMEOUT_MS = 1500;

const CANCEL_PATTERNS = [
  /^cancel(?: entry)?$/i,
  /^never mind$/i,
  /^stop$/i,
  /^stop listening$/i,
  /^forget it$/i,
  /^don't log(?: it| that)?$/i,
  /^do not log(?: it| that)?$/i,
  /^discard(?: it| that)?$/i,
];

const AFFIRMATIVE_PATTERNS = [
  /^yes$/i,
  /^yeah$/i,
  /^yep$/i,
  /^confirm$/i,
  /^correct$/i,
  /^that's right$/i,
  /^that is right$/i,
  /^log(?: it| that)?$/i,
  /^save(?: it| that)?$/i,
  /^okay$/i,
  /^ok$/i,
  /^sounds good$/i,
  /^do it$/i,
];

const pad2 = (value: number) => String(value).padStart(2, "0");

const getLocalDate = (now: Date) =>
  `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

const getUtcOffset = (now: Date) => {
  const totalMinutes = -now.getTimezoneOffset();
  const sign = totalMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return `${sign}${pad2(hours)}:${pad2(minutes)}`;
};

const normalizeTranscript = (value: string) =>
  value.trim().replace(/[.!?]+$/g, "").trim().toLowerCase();

const isCancelTranscript = (value: string) => {
  const normalized = normalizeTranscript(value);
  return CANCEL_PATTERNS.some((pattern) => pattern.test(normalized));
};

const isAffirmativeTranscript = (value: string) => {
  const normalized = normalizeTranscript(value);
  return AFFIRMATIVE_PATTERNS.some((pattern) => pattern.test(normalized));
};

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window) || !text.trim()) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.includes("Samantha") || voice.name.includes("Google") || voice.name.includes("Natural"))
    );

    if (preferred) {
      utterance.voice = preferred;
    }

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
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finalTranscriptRef = useRef("");
  const pendingEntryRef = useRef<VoiceEntry | null>(null);
  const supported = useRef(true);
  const shouldListenRef = useRef(false);
  const autoRestartBlockedRef = useRef(false);
  const startListeningRef = useRef<() => void>(() => {});

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const clearMessageTimer = useCallback(() => {
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
  }, []);

  const scheduleMessageClear = useCallback(() => {
    clearMessageTimer();
    messageTimerRef.current = setTimeout(() => {
      setState((current) => ({ ...current, botMessage: "", transcript: "" }));
    }, 2000);
  }, [clearMessageTimer]);

  const finalizeConversation = useCallback(
    (message: string) => {
      clearSilenceTimer();
      clearMessageTimer();
      conversationHistoryRef.current = [];
      finalTranscriptRef.current = "";
      pendingEntryRef.current = null;

      setState({
        isListening: false,
        isProcessing: false,
        isSpeaking: false,
        transcript: "",
        botMessage: message,
        conversationActive: false,
      });

      if (message) {
        scheduleMessageClear();
      }
    },
    [clearMessageTimer, clearSilenceTimer, scheduleMessageClear]
  );

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

    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }

    return () => {
      clearSilenceTimer();
      clearMessageTimer();
      try {
        recognition.stop();
      } catch {}
      window.speechSynthesis?.cancel();
    };
  }, [clearMessageTimer, clearSilenceTimer]);

  const processTranscript = useCallback(
    async (transcript: string) => {
      const trimmedTranscript = transcript.trim();
      if (!trimmedTranscript) return;

      clearSilenceTimer();

      if (isCancelTranscript(trimmedTranscript)) {
        shouldListenRef.current = false;
        autoRestartBlockedRef.current = true;
        clearMessageTimer();
        try {
          recognitionRef.current?.stop();
        } catch {}

        setState((current) => ({
          ...current,
          isListening: false,
          isProcessing: false,
          isSpeaking: true,
          transcript: "",
          botMessage: "Cancelled.",
          conversationActive: false,
        }));

        await speak("Cancelled.");
        finalizeConversation("Cancelled.");
        return;
      }

      if (pendingEntryRef.current && isAffirmativeTranscript(trimmedTranscript)) {
        const pendingEntry = pendingEntryRef.current;
        shouldListenRef.current = false;
        autoRestartBlockedRef.current = true;
        clearMessageTimer();
        try {
          recognitionRef.current?.stop();
        } catch {}

        onLogEntry(
          pendingEntry.categoryId,
          pendingEntry.detail,
          pendingEntry.durationSeconds || undefined,
          pendingEntry.loggedAt || undefined
        );

        setState((current) => ({
          ...current,
          isListening: false,
          isProcessing: false,
          isSpeaking: true,
          transcript: "",
          botMessage: "Logged.",
          conversationActive: false,
        }));

        await speak("Logged.");
        finalizeConversation("Logged.");
        return;
      }

      pendingEntryRef.current = null;
      autoRestartBlockedRef.current = true;

      setState((current) => ({
        ...current,
        isListening: false,
        isProcessing: true,
        isSpeaking: false,
        transcript: trimmedTranscript,
      }));

      try {
        recognitionRef.current?.stop();
      } catch {}

      conversationHistoryRef.current.push({ role: "user", content: trimmedTranscript });

      try {
        const now = new Date();
        const { data, error } = await supabase.functions.invoke("voice-assistant", {
          body: {
            transcript: trimmedTranscript,
            conversationHistory: conversationHistoryRef.current,
            localDate: getLocalDate(now),
            utcOffset: getUtcOffset(now),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        });

        if (error) throw error;

        const { action, message, entry } = data as {
          action: "ask" | "confirm" | "log" | "cancel";
          message: string;
          entry: VoiceEntry | null;
        };

        conversationHistoryRef.current.push({ role: "assistant", content: message });

        setState((current) => ({
          ...current,
          isProcessing: false,
          isSpeaking: true,
          botMessage: message,
        }));

        await speak(message);

        setState((current) => ({ ...current, isSpeaking: false }));

        if (action === "confirm" && entry) {
          pendingEntryRef.current = entry;
          autoRestartBlockedRef.current = false;
          if (shouldListenRef.current) {
            startListeningRef.current();
          }
          return;
        }

        if (action === "log" && entry) {
          shouldListenRef.current = false;
          autoRestartBlockedRef.current = true;
          onLogEntry(
            entry.categoryId,
            entry.detail,
            entry.durationSeconds || undefined,
            entry.loggedAt || undefined
          );
          finalizeConversation(message);
          return;
        }

        if (action === "cancel") {
          shouldListenRef.current = false;
          autoRestartBlockedRef.current = true;
          finalizeConversation(message);
          return;
        }

        autoRestartBlockedRef.current = false;
        if (shouldListenRef.current) {
          startListeningRef.current();
        }
      } catch (error) {
        console.error("Voice assistant error:", error);
        autoRestartBlockedRef.current = false;
        setState((current) => ({
          ...current,
          isListening: false,
          isProcessing: false,
          isSpeaking: false,
          botMessage: "Something went wrong. Try again.",
        }));
        scheduleMessageClear();
        if (shouldListenRef.current) {
          startListeningRef.current();
        }
      }
    },
    [clearMessageTimer, clearSilenceTimer, finalizeConversation, onLogEntry, scheduleMessageClear]
  );

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || !shouldListenRef.current) return;

    autoRestartBlockedRef.current = false;
    finalTranscriptRef.current = "";
    clearSilenceTimer();

    recognition.onresult = (event: any) => {
      clearSilenceTimer();

      let interimTranscript = "";
      let finalTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index++) {
        const result = event.results[index][0]?.transcript || "";
        if (event.results[index].isFinal) {
          finalTranscript += result;
        } else {
          interimTranscript += result;
        }
      }

      if (finalTranscript) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalTranscript}`.trim();
      }

      const displayTranscript = `${finalTranscriptRef.current} ${interimTranscript}`.trim();
      setState((current) => ({ ...current, transcript: displayTranscript }));

      silenceTimerRef.current = setTimeout(() => {
        const spokenText = finalTranscriptRef.current.trim();
        if (!spokenText) return;
        finalTranscriptRef.current = "";
        void processTranscript(spokenText);
      }, SILENCE_TIMEOUT_MS);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      if (shouldListenRef.current && !autoRestartBlockedRef.current) {
        try {
          recognition.start();
        } catch {}
      }
    };

    try {
      recognition.start();
      setState((current) => ({ ...current, isListening: true, isProcessing: false }));
    } catch {
      // recognition may already be active
    }
  }, [clearSilenceTimer, processTranscript]);

  startListeningRef.current = startListening;

  const startConversation = useCallback(() => {
    if (!supported.current) return;

    shouldListenRef.current = true;
    autoRestartBlockedRef.current = true;
    pendingEntryRef.current = null;
    conversationHistoryRef.current = [];
    clearSilenceTimer();
    clearMessageTimer();

    setState({
      isListening: false,
      isProcessing: false,
      isSpeaking: true,
      transcript: "",
      botMessage: "What would you like to log?",
      conversationActive: true,
    });

    speak("What would you like to log?").then(() => {
      if (!shouldListenRef.current) return;
      setState((current) => ({ ...current, isSpeaking: false, botMessage: "" }));
      autoRestartBlockedRef.current = false;
      startListeningRef.current();
    });
  }, [clearMessageTimer, clearSilenceTimer]);

  const stopConversation = useCallback(() => {
    shouldListenRef.current = false;
    autoRestartBlockedRef.current = true;
    clearSilenceTimer();
    clearMessageTimer();
    try {
      recognitionRef.current?.stop();
    } catch {}
    window.speechSynthesis?.cancel();
    conversationHistoryRef.current = [];
    finalTranscriptRef.current = "";
    pendingEntryRef.current = null;
    setState({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
      transcript: "",
      botMessage: "",
      conversationActive: false,
    });
  }, [clearMessageTimer, clearSilenceTimer]);

  return {
    ...state,
    startConversation,
    stopConversation,
    supported: supported.current,
  };
}
