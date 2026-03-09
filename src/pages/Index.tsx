import { useState, useCallback } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import TrackingGrid, { type TrackingCategory, categories } from "@/components/TrackingGrid";
import ActiveTimer from "@/components/ActiveTimer";
import RecentActivity, { type ActivityEntry } from "@/components/RecentActivity";
import QuickSummary from "@/components/QuickSummary";
import SmartLogFAB from "@/components/SmartLogFAB";
import InstallPrompt from "@/components/InstallPrompt";
import FeedLogModal from "@/components/FeedLogModal";
import DiaperLogModal from "@/components/DiaperLogModal";

const timerCategories = new Set(["sleep", "pump", "tummy", "story", "screen", "skincare", "play", "bath"]);
const modalCategories = new Set(["feed", "diaper"]);

const Index = () => {
  const [activeTimer, setActiveTimer] = useState<TrackingCategory | null>(null);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [diaperModalOpen, setDiaperModalOpen] = useState(false);

  const logEntry = useCallback((categoryId: string, detail: string) => {
    setEntries((prev) => [
      {
        id: crypto.randomUUID(),
        categoryId,
        time: new Date(),
        detail,
      },
      ...prev,
    ]);
  }, []);

  const handleCategoryTap = useCallback(
    (category: TrackingCategory) => {
      if (timerCategories.has(category.id)) {
        setActiveTimer(category);
      } else {
        logEntry(category.id, getDefaultDetail(category.id));
      }
    },
    [logEntry]
  );

  const handleTimerStop = useCallback(
    (category: TrackingCategory, durationSeconds: number) => {
      const mins = Math.round(durationSeconds / 60);
      logEntry(category.id, mins > 0 ? `${mins} min session` : `${durationSeconds}s session`);
      setActiveTimer(null);
    },
    [logEntry]
  );

  const handleStartTimer = useCallback((category: TrackingCategory) => {
    setActiveTimer(category);
  }, []);

  const handleQuickLog = useCallback((categoryId: string, detail: string) => {
    logEntry(categoryId, detail);
  }, [logEntry]);

  const handleVoiceCommand = useCallback(
    (command: string, category: TrackingCategory | null) => {
      if (command === "stop" && activeTimer) {
        setActiveTimer(null);
        return;
      }
      if (command === "listen") {
        // Voice listening handled by browser API in VoiceCommand
        return;
      }
      if (!category) return;

      if (command === "start" && timerCategories.has(category.id)) {
        setActiveTimer(category);
      } else {
        logEntry(category.id, getDefaultDetail(category.id));
      }
    },
    [activeTimer, logEntry]
  );

  const summary = {
    sleepHours: Math.round(
      entries
        .filter((e) => e.categoryId === "sleep")
        .reduce((acc, e) => {
          const match = e.detail.match(/(\d+) min/);
          return acc + (match ? parseInt(match[1]) / 60 : 0);
        }, 0) * 10
    ) / 10,
    feeds: entries.filter((e) => e.categoryId === "feed").length,
    diapers: entries.filter((e) => e.categoryId === "diaper").length,
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      <DashboardHeader />
      <QuickSummary summary={summary} />
      <TrackingGrid onCategoryTap={handleCategoryTap} />

      <div className="mt-4">
        <ActiveTimer
          category={activeTimer}
          onStop={handleTimerStop}
          onDismiss={() => setActiveTimer(null)}
        />
      </div>

      <div className="mt-4">
        <RecentActivity entries={entries} />
      </div>

      <SmartLogFAB
        onQuickLog={handleQuickLog}
        onStartTimer={handleStartTimer}
        onVoiceCommand={handleVoiceCommand}
        activeTimerCategory={activeTimer}
      />
      <InstallPrompt />
    </div>
  );
};

function getDefaultDetail(categoryId: string): string {
  switch (categoryId) {
    case "diaper": return "Diaper change logged";
    case "temp": return "Temperature recorded";
    case "growth": return "Measurement logged";
    case "meds": return "Medicine administered";
    case "notes": return "Note added";
    case "bath": return "Bath time logged";
    case "tummy": return "Tummy time logged";
    case "story": return "Story time logged";
    case "screen": return "Screen time logged";
    case "skincare": return "Skin to skin logged";
    case "play": return "Play time logged";
    case "brush": return "Teeth brushing logged";
    case "custom": return "Custom activity logged";
    default: return "Entry logged";
  }
}

export default Index;
