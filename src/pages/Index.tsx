import { useState, useCallback } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import TrackingGrid, { type TrackingCategory } from "@/components/TrackingGrid";
import ActiveTimer from "@/components/ActiveTimer";
import RecentActivity, { type ActivityEntry } from "@/components/RecentActivity";
import QuickSummary from "@/components/QuickSummary";

const timerCategories = new Set(["sleep", "feed", "pump"]);

const Index = () => {
  const [activeTimer, setActiveTimer] = useState<TrackingCategory | null>(null);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  const handleCategoryTap = useCallback(
    (category: TrackingCategory) => {
      if (timerCategories.has(category.id)) {
        setActiveTimer(category);
      } else {
        // Instant log for non-timer categories
        const newEntry: ActivityEntry = {
          id: crypto.randomUUID(),
          categoryId: category.id,
          time: new Date(),
          detail: getDefaultDetail(category.id),
        };
        setEntries((prev) => [newEntry, ...prev]);
      }
    },
    []
  );

  const handleTimerStop = useCallback(
    (category: TrackingCategory, durationSeconds: number) => {
      const mins = Math.round(durationSeconds / 60);
      const newEntry: ActivityEntry = {
        id: crypto.randomUUID(),
        categoryId: category.id,
        time: new Date(),
        detail: mins > 0 ? `${mins} min session` : `${durationSeconds}s session`,
      };
      setEntries((prev) => [newEntry, ...prev]);
      setActiveTimer(null);
    },
    []
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
    <div className="min-h-screen bg-background max-w-md mx-auto">
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
    default: return "Entry logged";
  }
}

export default Index;
