import { useState, useMemo } from "react";
import { format, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import WeekTimeline from "@/components/reports/WeekTimeline";
import DayTimeline from "@/components/reports/DayTimeline";
import RecentEntries from "@/components/reports/RecentEntries";
import SleepSummary from "@/components/reports/SleepSummary";
import FeedSummary from "@/components/reports/FeedSummary";

type ViewMode = "day" | "week" | "list" | "summary";

const viewModes: { id: ViewMode; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "list", label: "List" },
  { id: "summary", label: "Summary" },
];

const generateMockSleepData = () =>
  Array.from({ length: 7 }, (_, i) => ({
    day: format(subDays(new Date(), 6 - i), "EEE"),
    nap: Math.round((2 + Math.random() * 2) * 10) / 10,
    night: Math.round((8 + Math.random() * 3) * 10) / 10,
  }));

const generateMockFeedData = () =>
  Array.from({ length: 7 }, (_, i) => ({
    day: format(subDays(new Date(), 6 - i), "EEE"),
    feeds: Math.floor(5 + Math.random() * 4),
    oz: Math.round((18 + Math.random() * 10) * 10) / 10,
  }));

const Reports = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [activePeriod, setActivePeriod] = useState("7D");
  const [currentDate, setCurrentDate] = useState(new Date());

  const sleepData = useMemo(generateMockSleepData, []);
  const feedData = useMemo(generateMockFeedData, []);

  const totalNap = sleepData.reduce((a, d) => a + d.nap, 0) / sleepData.length;
  const totalNight = sleepData.reduce((a, d) => a + d.night, 0) / sleepData.length;
  const totalDaily = totalNap + totalNight;

  const pieData = [
    { name: "Nap", value: totalNap, color: "hsl(230, 45%, 82%)" },
    { name: "Night", value: totalNight, color: "hsl(230, 45%, 72%)" },
  ];

  const navigateDate = (direction: number) => {
    const days = viewMode === "week" ? 7 : 1;
    setCurrentDate((d) => subDays(d, days * direction));
  };

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto pb-24">
      {/* Header with child name */}
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm">👶</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">Baby</h1>
        </div>
        <button className="w-8 h-8 rounded-lg bg-card flex items-center justify-center tracking-card-shadow">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </header>

      {/* View Mode Tabs - Huckleberry style */}
      <div className="px-5 mb-3 flex items-center gap-2">
        <div className="flex-1 flex bg-muted rounded-xl p-1">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                viewMode === mode.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date navigation */}
      {(viewMode === "day" || viewMode === "week") && (
        <div className="px-5 mb-3 flex items-center justify-between">
          <button
            onClick={() => navigateDate(1)}
            className="w-8 h-8 rounded-lg bg-card flex items-center justify-center tracking-card-shadow active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-sm font-medium text-foreground">
            {viewMode === "day"
              ? format(currentDate, "EEEE, MMM d")
              : `Week of ${format(currentDate, "MMM d")}`}
          </span>
          <button
            onClick={() => navigateDate(-1)}
            className="w-8 h-8 rounded-lg bg-card flex items-center justify-center tracking-card-shadow active:scale-95 transition-transform"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      )}

      {/* Week View - Huckleberry-style colored block timeline */}
      {viewMode === "week" && (
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          <WeekTimeline currentDate={currentDate} />
          <div className="mt-3 border-t border-border/40 pt-1">
            <RecentEntries />
          </div>
        </div>
      )}

      {/* Day View - Vertical timeline with blocks */}
      {viewMode === "day" && (
        <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          <DayTimeline currentDate={currentDate} />
        </div>
      )}

      {/* List View - Card-based entries */}
      {viewMode === "list" && (
        <RecentEntries />
      )}

      {/* Summary View */}
      {viewMode === "summary" && (
        <div className="space-y-4">
          <SleepSummary
            sleepData={sleepData}
            pieData={pieData}
            totalNap={totalNap}
            totalNight={totalNight}
            totalDaily={totalDaily}
            activePeriod={activePeriod}
            setActivePeriod={setActivePeriod}
          />
          <FeedSummary
            feedData={feedData}
            activePeriod={activePeriod}
            setActivePeriod={setActivePeriod}
          />
        </div>
      )}
    </div>
  );
};

export default Reports;
