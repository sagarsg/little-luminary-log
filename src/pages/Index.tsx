import { useState, useCallback, useEffect } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import TrackingGrid, { type TrackingCategory, categories } from "@/components/TrackingGrid";
import ActiveTimer from "@/components/ActiveTimer";
import RecentActivity, { type ActivityEntry } from "@/components/RecentActivity";
import QuickSummary from "@/components/QuickSummary";
import SmartLogFAB from "@/components/SmartLogFAB";
import InstallPrompt from "@/components/InstallPrompt";
import FeedLogModal from "@/components/FeedLogModal";
import DiaperLogModal from "@/components/DiaperLogModal";
import ActivityLogModal from "@/components/ActivityLogModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const [activeTimer, setActiveTimer] = useState<TrackingCategory | null>(null);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [feedModalOpen, setFeedModalOpen] = useState(false);
  const [diaperModalOpen, setDiaperModalOpen] = useState(false);
  const [activityModalCategory, setActivityModalCategory] = useState<TrackingCategory | null>(null);

  // Load today's entries from database
  useEffect(() => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loadEntries = async () => {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", today.toISOString())
        .order("logged_at", { ascending: false });

      if (error) {
        console.error("Failed to load entries:", error);
        return;
      }

      setEntries(
        (data || []).map((e) => ({
          id: e.id,
          categoryId: e.category_id,
          time: new Date(e.logged_at),
          detail: e.detail,
        }))
      );
    };

    loadEntries();
  }, [user]);

  const logEntry = useCallback(
    async (categoryId: string, detail: string, durationSeconds?: number, loggedAt?: string) => {
      if (!user) return;

      const entryTime = loggedAt ? new Date(loggedAt) : new Date();

      const newEntry: ActivityEntry = {
        id: crypto.randomUUID(),
        categoryId,
        time: entryTime,
        detail,
      };

      // Optimistic update
      setEntries((prev) => [newEntry, ...prev]);

      const { error } = await supabase.from("entries").insert({
        id: newEntry.id,
        user_id: user.id,
        category_id: categoryId,
        detail,
        duration_seconds: durationSeconds || null,
        logged_at: entryTime.toISOString(),
      });

      if (error) {
        console.error("Failed to save entry:", error);
        toast.error("Failed to save — check your connection");
        setEntries((prev) => prev.filter((e) => e.id !== newEntry.id));
      }
    },
    [user]
  );

  const handleCategoryTap = useCallback(
    (category: TrackingCategory) => {
      if (category.id === "feed") {
        setFeedModalOpen(true);
      } else if (category.id === "diaper") {
        setDiaperModalOpen(true);
      } else {
        // All other categories go through the ActivityLogModal
        setActivityModalCategory(category);
      }
    },
    []
  );

  const handleTimerStop = useCallback(
    (category: TrackingCategory, durationSeconds: number) => {
      const mins = Math.round(durationSeconds / 60);
      logEntry(
        category.id,
        mins > 0 ? `${mins} min session` : `${durationSeconds}s session`,
        durationSeconds
      );
      setActiveTimer(null);
    },
    [logEntry]
  );

  const handleStartTimer = useCallback((category: TrackingCategory) => {
    setActiveTimer(category);
  }, []);

  const handleQuickLog = useCallback(
    (categoryId: string, detail: string, durationSeconds?: number) => {
      logEntry(categoryId, detail, durationSeconds);
    },
    [logEntry]
  );

  // Listen for voice log entries from BottomNav conversational assistant
  useEffect(() => {
    const handler = (e: Event) => {
      const { categoryId, detail, durationSeconds, loggedAt } = (e as CustomEvent).detail;
      logEntry(categoryId, detail, durationSeconds, loggedAt);
    };
    window.addEventListener("voice-log-entry", handler);
    return () => window.removeEventListener("voice-log-entry", handler);
  }, [logEntry]);
  const summary = {
    sleepHours:
      Math.round(
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
      />
      <FeedLogModal
        open={feedModalOpen}
        onClose={() => setFeedModalOpen(false)}
        onLog={handleQuickLog}
        onStartTimer={() => {
          const feedCat = categories.find((c) => c.id === "feed");
          if (feedCat) setActiveTimer(feedCat);
        }}
      />
      <DiaperLogModal
        open={diaperModalOpen}
        onClose={() => setDiaperModalOpen(false)}
        onLog={handleQuickLog}
      />
      <ActivityLogModal
        open={!!activityModalCategory}
        category={activityModalCategory}
        onClose={() => setActivityModalCategory(null)}
        onLog={handleQuickLog}
        onStartTimer={(cat) => {
          setActivityModalCategory(null);
          setActiveTimer(cat);
        }}
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
